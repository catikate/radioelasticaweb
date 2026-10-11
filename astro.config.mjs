import { defineConfig } from 'astro/config'
import react    from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import netlify  from '@astrojs/netlify'
import sitemap  from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://radioelastica.com',
  output: 'hybrid',
  // imageCDN: false → las imágenes de astro:assets se generan en el build (WebP
  // estáticos en /_astro) en vez de transformarse bajo demanda en Netlify Image CDN.
  adapter: netlify({ imageCDN: false }),
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