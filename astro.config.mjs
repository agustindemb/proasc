import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://proasc.co',
  integrations: [
    sitemap({
      filter: (page) => page !== 'https://proasc.co/404/',
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
