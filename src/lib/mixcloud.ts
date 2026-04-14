// ============================================================
// Radio Elástica — Mixcloud API
// Todas las llamadas a la API viven aquí.
// Nunca hagas fetch de Mixcloud fuera de este archivo.
// ============================================================

import { MIXCLOUD_BASE, MIXCLOUD_USER, CACHE } from './constants'
import type { Cloudcast, MixcloudUser, MixcloudResponse } from './types'

// ------------------------------------------------------------
// Utilidades internas
// ------------------------------------------------------------

async function mxFetch<T>(
  path: string,
  params: Record<string, string> = {},
  cacheSeconds = CACHE.CLOUDCASTS
): Promise<T | null> {
  const url = new URL(`${MIXCLOUD_BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  try {
    const res = await fetch(url.toString(), {
      headers: { 'Cache-Control': `max-age=${cacheSeconds}` },
    })
    if (!res.ok) {
      console.error(`[Mixcloud] ${res.status} — ${url}`)
      return null
    }
    return res.json() as Promise<T>
  } catch (err) {
    console.error('[Mixcloud] fetch failed:', err)
    return null
  }
}

// ------------------------------------------------------------
// Episodios (cloudcasts)
// ------------------------------------------------------------

/**
 * Lista los episodios de un usuario.
 * Si tags es un string (ej: 'residente-marta'), filtra por ese tag.
 */
export async function getCloudcasts(
  username = MIXCLOUD_USER,
  options: {
    limit?:  number
    offset?: number
    tags?:   string
    order?:  'latest' | 'popular'
  } = {}
): Promise<Cloudcast[]> {
  const params: Record<string, string> = {
    limit: String(options.limit ?? 20),
  }
  if (options.offset) params.offset = String(options.offset)
  if (options.tags)   params.tags   = options.tags
  if (options.order)  params.order  = options.order

  const res = await mxFetch<MixcloudResponse<Cloudcast>>(
    `/${username}/cloudcasts/`,
    params
  )
  return res?.data ?? []
}

/**
 * El episodio más reciente de la radio.
 * Se usa en el reproductor cuando está en estado offline.
 */
export async function getLatestCloudcast(
  username = MIXCLOUD_USER
): Promise<Cloudcast | null> {
  const items = await getCloudcasts(username, { limit: 1, order: 'latest' })
  return items[0] ?? null
}

/**
 * Detalle de un episodio concreto por su slug.
 */
export async function getCloudcast(
  slug:     string,
  username = MIXCLOUD_USER
): Promise<Cloudcast | null> {
  return mxFetch<Cloudcast>(`/${username}/${slug}/`)
}

/**
 * Episodios de un residente concreto, filtrados por tag.
 * El tag debe seguir la convención: "residente-{nombre}"
 */
export async function getCloudcastsByResidente(
  tag:      string,
  username = MIXCLOUD_USER,
  limit    = 20
): Promise<Cloudcast[]> {
  return getCloudcasts(username, { tags: tag, limit })
}

/**
 * Episodios de un programa concreto, filtrados por tag.
 * El tag debe seguir la convención: "{nombre-programa}"
 */
export async function getCloudcastsByPrograma(
  tag:      string,
  username = MIXCLOUD_USER,
  limit    = 20
): Promise<Cloudcast[]> {
  return getCloudcasts(username, { tags: tag, limit })
}

// ------------------------------------------------------------
// Perfil de usuario
// ------------------------------------------------------------

/**
 * Perfil público de un usuario de Mixcloud.
 * Usado para la página de residentes si tienen cuenta propia.
 */
export async function getMixcloudUser(
  username = MIXCLOUD_USER
): Promise<MixcloudUser | null> {
  return mxFetch<MixcloudUser>(`/${username}/`, {}, CACHE.PROFILE)
}

// ------------------------------------------------------------
// Helpers para construir URLs del reproductor
// ------------------------------------------------------------

/**
 * Devuelve la Mixcloud key de un episodio.
 * Es lo que se pasa a widget.load().
 */
export function cloudcastKey(slug: string, username = MIXCLOUD_USER): string {
  return `/${username}/${slug}/`
}

/**
 * Key del stream en vivo de la radio.
 */
export function liveKey(username = MIXCLOUD_USER): string {
  return `/${username}/`
}

/**
 * URL del iframe del widget con opciones estándar.
 */
export function widgetSrc(key?: string): string {
  const base = 'https://player-widget.mixcloud.com/'
  const params = new URLSearchParams({
    hide_cover: '1',
    mini:       '1',
    autoplay:   '0',
  })
  // Decodificar la key para evitar doble encoding por URLSearchParams
  if (key) params.set('feed', decodeURIComponent(key))
  return `${base}?${params}`
}

// ------------------------------------------------------------
// Helpers de formato
// ------------------------------------------------------------

/**
 * Convierte segundos a "1h 23min" o "45min"
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}

/**
 * Fecha de publicación en formato legible
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  })
}
