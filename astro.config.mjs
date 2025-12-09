import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  integrations: [mdx(), sitemap()],
  site: 'https://parameddiy.com',
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
});

