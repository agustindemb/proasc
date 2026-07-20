/**
 * /sitemap.xml — Permanent redirect to the Astro-generated sitemap index.
 *
 * Root cause context:
 *   @astrojs/sitemap always generates `sitemap-index.xml` (+ `sitemap-0.xml`
 *   for the actual URLs). It never creates a file named `sitemap.xml`.
 *   Google Search Console was submitted with /sitemap.xml, which returns 404.
 *
 * Fix:
 *   This SSR endpoint intercepts GET /sitemap.xml and issues a 301 redirect
 *   to /sitemap-index.xml. Google will follow the redirect, update its records,
 *   and correctly index the sitemap on subsequent crawls.
 *
 *   After confirming Google has processed the redirect, update Search Console
 *   to submit https://proasc.com/sitemap-index.xml directly.
 */
export const prerender = false;

export function GET(): Response {
  return new Response(null, {
    status: 301,
    headers: {
      Location: '/sitemap-index.xml',
      'Cache-Control': 'public, max-age=86400', // cache the redirect 24h
    },
  });
}
