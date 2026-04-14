import { defineConfig } from 'astro/config'
import react    from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import netlify  from '@astrojs/netlify'
import sitemap  from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://radioelastica.com',
  output: 'hybrid',
  adapter: netlify(),
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    sitemap({
      filter: (page) => !page.includes('/CLAUDE/'),
    }),
  ],
  image: {
    domains: ['thumbnailer.mixcloud.com'],
  },
})