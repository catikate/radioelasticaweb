// ============================================================
// Radio Elástica — Mixcloud Widget singleton
// ============================================================

import type { WidgetPlayer, PlayerTrack } from './types'
import {
  $currentTrack,
  $playerStatus,
  $progress,
  $position,
  $duration,
} from './store'

let _widget: WidgetPlayer | null = null
let _ready = false

function normalizeKey(key: string): string {
  if (!key) throw new Error('[Widget] empty key')

  // ya viene correcto
  if (key.startsWith('/')) return key

  // evitar doble encoding raro
  const decoded = decodeURIComponent(key)

  return decoded.startsWith('/') ? decoded : `/${decoded}/`
}

/**
 * Inicializa el widget
 */
export async function initWidget(): Promise<WidgetPlayer> {
  if (_ready && _widget) return _widget

  const iframe = document.getElementById('mc-widget') as HTMLIFrameElement

  if (!iframe) {
    throw new Error('[Widget] mc-widget iframe not found')
  }

  if (!iframe.src || !iframe.src.includes('mixcloud')) {
    throw new Error('[Widget] iframe src not ready')
  }

  console.log('[Widget] iframe ready:', iframe.src)
  console.log('[Widget] Mixcloud available:', !!window.Mixcloud)

  _widget = window.Mixcloud.PlayerWidget(iframe)

  await _widget.ready
  _ready = true

  // events
  _widget.events.play.on(() => $playerStatus.set('playing'))
  _widget.events.pause.on(() => $playerStatus.set('paused'))
  _widget.events.ended.on(() => $playerStatus.set('ended'))
  _widget.events.error.on(() => $playerStatus.set('idle'))

  _widget.events.progress.on((pos: number, dur: number) => {
    $progress.set(dur > 0 ? pos / dur : 0)
    $position.set(pos)
    $duration.set(dur)
  })

  return _widget
}

/**
 * Reproducir track (episodio o live)
 */
export async function playTrack(track: PlayerTrack): Promise<void> {
  $playerStatus.set('loading')
  $currentTrack.set(track)

  const key    = normalizeKey(track.key)
  const widget = await initWidget()

  await widget.load(key, false)
  widget.play()
}

/**
 * Salta a posición
 */
export async function seekTo(seconds: number): Promise<void> {
  const widget = await initWidget()
  widget.seek(seconds)
}

/**
 * LIVE STREAM
 */
export async function goLive(): Promise<void> {
  const { liveKey } = await import('./mixcloud')

  const key = normalizeKey(liveKey())

  const track: PlayerTrack = {
    key,
    title: 'Radio Elástica',
    dj: 'En vivo',
    cover: '/assets/logo-square.jpg',
    duration: 0,
    isLive: true,
  }
  $playerStatus.set('loading')
  $currentTrack.set(track)

  const widget = await initWidget()

  await widget.load(key, false)
  widget.play()
}

/**
 * Play/pause toggle.
 * Si no hay track cargado y la emisión está en vivo, arranca el directo.
 */
export async function togglePlay(): Promise<void> {
  const status = $playerStatus.get()
  const track  = $currentTrack.get()

  // Sin track cargado + emisión en vivo → arrancar directo
  if (!track) {
    const { getEmisionState } = await import('./schedule')
    if (getEmisionState() === 'live') {
      await goLive()
      return
    }
  }

  const widget = await initWidget()
  if (status === 'playing') {
    widget.pause()
  } else {
    widget.play()
  }
}