import fs from 'fs';
import path from 'path';

// Extensions that are static assets, not HTML routes — skip link validation
const STATIC_ASSET_EXTENSIONS = ['.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.pdf', '.xml', '.txt'];
const isStaticAsset = (href) => STATIC_ASSET_EXTENSIONS.some(ext => href.split('?')[0].endsWith(ext)) || href.startsWith('/_astro/');

const distDir = path.join(process.cwd(), 'dist');

// CLI Colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

if (!fs.existsSync(distDir)) {
  console.error(`${colors.red}${colors.bold}Error: La carpeta /dist no existe. Debes ejecutar "npm run build" primero.${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.cyan}${colors.bold}Iniciando Auditoría SEO en /dist...${colors.reset}\n`);

// Helper to recursively get all HTML files
function getHtmlFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getHtmlFiles(filePath, filesList);
    } else if (file.endsWith('.html')) {
      filesList.push(filePath);
    }
  }
  return filesList;
}

const htmlFiles = getHtmlFiles(distDir);
let totalErrors = 0;
let totalWarnings = 0;

// Set of all generated output routes for link validation
const activeRoutes = new Set();
htmlFiles.forEach(file => {
  let route = '/' + path.relative(distDir, file).replace(/\\/g, '/');
  // Normalize routes (e.g. /index.html -> /, /blog/index.html -> /blog, etc.)
  if (route.endsWith('/index.html')) {
    route = route.slice(0, -11) || '/';
  } else if (route.endsWith('.html')) {
    route = route.slice(0, -5);
  }
  activeRoutes.add(route);
});

// Audit each HTML file
htmlFiles.forEach(file => {
  const relativePath = path.relative(distDir, file);
  const content = fs.readFileSync(file, 'utf-8');
  const fileErrors = [];
  const fileWarnings = [];

  // 1. Check <title>
  const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
  if (!titleMatch) {
    fileErrors.push('Falta la etiqueta <title>.');
  } else {
    const titleText = titleMatch[1].trim();
    if (!titleText) {
      fileErrors.push('La etiqueta <title> está vacía.');
    } else if (titleText.length > 70) {
      fileWarnings.push(`El título es muy largo (${titleText.length} caracteres). Recomendado: < 70.`);
    }
  }

  // 2. Check Meta Description
  const descMatch = content.match(/<meta\s+name="description"\s+content="([\s\S]*?)"/i) || 
                    content.match(/<meta\s+content="([\s\S]*?)"\s+name="description"/i);
  if (!descMatch) {
    fileErrors.push('Falta la etiqueta <meta name="description">.');
  } else {
    const descText = descMatch[1].trim();
    if (!descText) {
      fileErrors.push('La descripción meta está vacía.');
    } else if (descText.length > 165) {
      fileWarnings.push(`La descripción meta es muy larga (${descText.length} caracteres). Recomendado: < 165.`);
    } else if (descText.length < 50) {
      fileWarnings.push(`La descripción meta es muy corta (${descText.length} caracteres). Recomendado: > 50.`);
    }
  }

  // 3. Check Canonical Link
  const canonicalMatch = content.match(/<link\s+rel="canonical"\s+href="([\s\S]*?)"/i) ||
                         content.match(/<link\s+href="([\s\S]*?)"\s+rel="canonical"/i);
  if (!canonicalMatch) {
    fileErrors.push('Falta la etiqueta <link rel="canonical">.');
  } else {
    const href = canonicalMatch[1].trim();
    if (!href) {
      fileErrors.push('El enlace canonical está vacío.');
    } else if (!href.startsWith('https://proasc.co')) {
      fileErrors.push(`El canonical apunta a un dominio incorrecto o no seguro: "${href}".`);
    }
  }

  // 4. Check H1 headings
  const h1Matches = content.match(/<h1[\s>]/gi) || [];
  if (h1Matches.length === 0) {
    fileErrors.push('La página no tiene ninguna etiqueta <h1>.');
  } else if (h1Matches.length > 1) {
    fileErrors.push(`La página tiene múltiples etiquetas <h1> (${h1Matches.length} detectadas).`);
  }

  // 5. Check JSON-LD schemas
  const schemaMatches = content.match(/<script\s+type="application\/ld\+json"/gi) || [];
  if (schemaMatches.length === 0) {
    fileWarnings.push('No se detectó ningún marcado estructurado de datos (Schema JSON-LD).');
  }

  // 6. Check Images
  const imgRegex = /<img\s+([\s\S]*?)>/gi;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(content)) !== null) {
    const imgAttributes = imgMatch[1];
    
    // Check Alt
    const altMatch = imgAttributes.match(/alt="([\s\S]*?)"/i);
    if (!altMatch) {
      fileErrors.push(`Imagen detectada sin atributo alt: "${imgMatch[0].substring(0, 50)}..."`);
    } else if (!altMatch[1].trim()) {
      fileErrors.push(`Imagen detectada con atributo alt vacío: "${imgMatch[0].substring(0, 50)}..."`);
    }

    // Check Width & Height (prevents CLS layout shift)
    const widthMatch = imgAttributes.match(/width="([\s\S]*?)"/i);
    const heightMatch = imgAttributes.match(/height="([\s\S]*?)"/i);
    if (!widthMatch || !heightMatch) {
      fileWarnings.push(`Imagen sin dimensiones width/height definidas (riesgo de CLS): "${imgMatch[0].substring(0, 50)}..."`);
    }

    // Check WebP format
    const srcMatch = imgAttributes.match(/src="([\s\S]*?)"/i);
    if (srcMatch) {
      const src = srcMatch[1];
      if (!src.endsWith('.webp') && !src.endsWith('.svg') && !src.includes('data:image')) {
        fileWarnings.push(`Imagen no utiliza formato WebP o SVG optimizado: "${src}"`);
      }
    }
  }

  // 7. Check Internal Links
  const linkRegex = /href="([\s\S]*?)"/gi;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(content)) !== null) {
    const href = linkMatch[1].trim();
    // Skip external, anchor, mailto, tel, and static asset links
    if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !isStaticAsset(href)) {
      // Normalize internal link (remove hash for validation)
      const cleanHref = href.split('#')[0];
      if (cleanHref) {
        let targetRoute = cleanHref;
        // Ensure starting slash
        if (!targetRoute.startsWith('/')) {
          targetRoute = '/' + targetRoute;
        }
        // Remove trailing slash if not root
        if (targetRoute.length > 1 && targetRoute.endsWith('/')) {
          targetRoute = targetRoute.slice(0, -1);
        }
        
        if (!activeRoutes.has(targetRoute)) {
          fileErrors.push(`Enlace interno roto detectado: "${href}" (la ruta objetivo no existe).`);
        }
      }
    }
  }

  // Display results
  if (fileErrors.length > 0 || fileWarnings.length > 0) {
    console.log(`${colors.bold}${relativePath}${colors.reset}`);
    
    fileErrors.forEach(err => {
      console.log(`  ${colors.red}✗ Error:${colors.reset} ${err}`);
      totalErrors++;
    });

    fileWarnings.forEach(warn => {
      console.log(`  ${colors.yellow}⚠ Advertencia:${colors.reset} ${warn}`);
      totalWarnings++;
    });
    console.log('');
  }
});

console.log(`${colors.bold}Resumen de la Auditoría SEO:${colors.reset}`);
if (totalErrors === 0) {
  console.log(`  ${colors.green}✔ ${htmlFiles.length} páginas analizadas. Cero errores críticos detectados.${colors.reset}`);
} else {
  console.log(`  ${colors.red}✗ Se encontraron ${totalErrors} errores críticos de SEO.${colors.reset}`);
}

if (totalWarnings > 0) {
  console.log(`  ${colors.yellow}⚠ Se encontraron ${totalWarnings} advertencias de optimización.${colors.reset}`);
} else {
  console.log(`  ${colors.green}✔ Cero advertencias detectadas.${colors.reset}`);
}

if (totalErrors > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
