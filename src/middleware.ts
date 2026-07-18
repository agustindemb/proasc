import { defineMiddleware } from 'astro:middleware';

// ---------------------------------------------------------------------------
// Rate limiting store — in-memory, per process
// ---------------------------------------------------------------------------
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_MAX    = 20;      // max requests
const RATE_LIMIT_WINDOW = 60_000;  // 1 minute in ms

/**
 * Extracts the real client IP from X-Forwarded-For.
 * Coolify runs Traefik as a reverse proxy, so request.socket.remoteAddress
 * would always return the proxy's internal IP (127.0.0.1). We read the
 * X-Forwarded-For header instead. The header can be a comma-separated list
 * "client, proxy1, proxy2" — the first value is always the original client IP.
 */
function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

// ---------------------------------------------------------------------------
// Structured logger — writes JSON to stdout (captured by Coolify log panel)
// ---------------------------------------------------------------------------
function log(
  level: 'INFO' | 'WARN' | 'ERROR',
  event: string,
  data: Record<string, unknown> = {}
): void {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level,
      event,
      ...data,
    })
  );
}

// ---------------------------------------------------------------------------
// Security headers
// ---------------------------------------------------------------------------

/** Strict CSP for public pages (blog, landings, etc.) */
const CSP_PUBLIC = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
].join('; ');

/**
 * Relaxed CSP for /keystatic/* routes.
 * NOTE: 'unsafe-eval' is required by Keystatic's React runtime and its
 * Markdoc template compiler. Review this policy when updating @keystatic/core
 * — future versions may not require unsafe-eval. Use
 * Content-Security-Policy-Report-Only in dev to verify if it can be removed.
 */
const CSP_KEYSTATIC = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "connect-src 'self' https://api.github.com https://github.com https://avatars.githubusercontent.com",
  "frame-ancestors 'none'",
].join('; ');

/** Headers applied to all routes */
const BASE_SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options':           'DENY',
  'X-Content-Type-Options':    'nosniff',
  'Referrer-Policy':           'strict-origin-when-cross-origin',
  'Permissions-Policy':        'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
};

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
export const onRequest = defineMiddleware(async (context, next) => {
  const { request } = context;
  const url  = new URL(request.url);
  const path = url.pathname;
  const ip   = getClientIp(request);

  const isKeystatic     = path.startsWith('/keystatic');
  const isKeystaticApi  = path.startsWith('/api/keystatic');
  const isOAuthCallback = path.startsWith('/api/keystatic/github/oauth/callback');
  const isCommitRoute   = path.startsWith('/api/keystatic/github/');

  // ── 1. Rate limiting — only on /api/keystatic/* ──────────────────────────
  if (isKeystaticApi) {
    const { allowed } = checkRateLimit(ip);

    if (!allowed) {
      log('WARN', 'rate_limit_exceeded', { ip, path, method: request.method });
      return new Response('Too Many Requests', {
        status: 429,
        headers: {
          'Content-Type': 'text/plain',
          'Retry-After':  '60',
          ...BASE_SECURITY_HEADERS,
        },
      });
    }
  }

  // ── 2. Logging ─────────────────────────────────────────────────────────────
  if (isKeystatic || isKeystaticApi) {
    const userAgent = request.headers.get('user-agent') ?? 'unknown';

    // General access log
    log('INFO', 'keystatic_request', { ip, path, method: request.method, userAgent });

    // Detect OAuth callback
    if (isOAuthCallback) {
      const hasCode  = url.searchParams.has('code');
      const hasError = url.searchParams.has('error');

      if (hasCode) {
        log('INFO', 'oauth_callback_success', { ip, userAgent });
      } else if (hasError) {
        log('ERROR', 'oauth_callback_error', {
          ip,
          userAgent,
          error:            url.searchParams.get('error'),
          errorDescription: url.searchParams.get('error_description'),
        });
      }
    }

    // Detect commit attempts (write operations to GitHub)
    if (isCommitRoute && !isOAuthCallback) {
      log('INFO', 'commit_attempt', { ip, path, method: request.method });
    }
  }

  // ── 3. Execute route handler ───────────────────────────────────────────────
  const response = await next();

  // ── 4. Post-response logging (detect commit errors) ────────────────────────
  if (isCommitRoute && !isOAuthCallback && response.status >= 400) {
    log('ERROR', 'commit_error', {
      ip,
      path,
      status: response.status,
    });
  }

  // Detect session/auth failures
  if (isKeystaticApi && response.status === 401) {
    log('WARN', 'session_invalid', { ip, path });
  }

  // ── 5. Apply security headers to the response ──────────────────────────────
  const csp = isKeystatic || isKeystaticApi ? CSP_KEYSTATIC : CSP_PUBLIC;

  Object.entries(BASE_SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  response.headers.set('Content-Security-Policy', csp);

  return response;
});
