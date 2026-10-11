// ============================================================
// Radio Elástica — Imágenes locales (astro:assets)
//
// Los originales viven a resolución completa en src/assets/ y cada build
// genera las versiones WebP a los tamaños que realmente se muestran.
// Solo para usar en el frontmatter de .astro — no importar desde código cliente.
// ============================================================

import type { ImageMetadata } from 'astro'

type Glob = Record<string, { default: ImageMetadata }>

const programas  = import.meta.glob('/src/assets/programas/*.png',      { eager: true }) as Glob
const desc       = import.meta.glob('/src/assets/programas/desc/*.png', { eager: true }) as Glob
const residentes = import.meta.glob('/src/assets/residentes/*.png',     { eager: true }) as Glob

export const FALLBACK_IMG = '/assets/logo-square-reducido.jpg'

// Devuelven undefined si no existe la imagen del slug → <Foto> pinta el logo.
export const fotoPrograma  = (slug: string) => programas[`/src/assets/programas/${slug}.png`]?.default
export const descPrograma  = (slug: string) => desc[`/src/assets/programas/desc/${slug}.png`]?.default
export const fotoResidente = (slug: string) => residentes[`/src/assets/residentes/${slug}.png`]?.default

// Anchos generados y `sizes` por contexto de uso
export const IMG = {
  // Grids de /programas y /residentes: 2 columnas en móvil, 3 hasta max-w-4xl
  grid: {
    widths: [200, 300, 450, 600],
    sizes:  '(min-width: 944px) 288px, (min-width: 640px) calc((100vw - 80px) / 3), calc((100vw - 60px) / 2)',
  },
  // Cabecera de /programas/[slug]: w-64 sm:w-80
  programa: {
    widths: [256, 320, 480, 640],
    sizes:  '(min-width: 640px) 320px, 256px',
  },
  // Cabecera de /residentes/[slug]: w-64
  residente: {
    widths: [256, 384, 512],
    sizes:  '256px',
  },
  // Icono de programa en /residentes/[slug]: w-10
  icon: {
    widths: [40, 80, 120],
    sizes:  '40px',
  },
  // Banner de descripción: ancho completo dentro de max-w-3xl
  desc: {
    widths: [480, 720, 1080, 1440],
    sizes:  '(min-width: 768px) 720px, calc(100vw - 48px)',
  },
} as const
