import { defineConfig } from 'astro/config'
import react    from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import netlify  from '@astrojs/netlify'

export default defineConfig({
  site: 'https://radioelastica.com',
  output: 'hybrid',
  adapter: netlify(),
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
  ],
  image: {
    domains: ['thumbnailer.mixcloud.com'],
  },
})
