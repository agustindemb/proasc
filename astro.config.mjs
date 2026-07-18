import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import node from '@astrojs/node';
import keystatic from '@keystatic/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://proasc.com',
  output: 'hybrid',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    react(),
    markdoc(),
    keystatic(),
    sitemap({
      filter: (page) =>
        page !== 'https://proasc.com/404/' &&
        !page.startsWith('https://proasc.com/keystatic'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        // Ensure every item has a valid loc string
        if (!item.url || typeof item.url !== 'string') return undefined;
        return item;
      },
    }),
  ],
});

