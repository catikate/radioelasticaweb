// ============================================================
// Radio Elástica — Mixcloud Widget singleton
// El widget se inicializa una sola vez y se reutiliza siempre.
// Nunca destruyas ni recrees el iframe.
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

/**
 * Inicializa el widget y lo conecta al store.
 * Llámalo solo desde PlayerBar al montar.
 */
export async function initWidget(): Promise<WidgetPlayer> {
  if (_ready && _widget) return _widget

  const iframe = document.getElementById('mc-widget') as HTMLIFrameElement
  if (!iframe) throw new Error('[Widget] mc-widget iframe not found')

  console.log('[Widget] iframe found, src:', iframe.src)
  console.log('[Widget] Mixcloud API available:', !!window.Mixcloud)

  _widget = window.Mixcloud.PlayerWidget(iframe)
  console.log('[Widget] waiting for ready...')
  await _widget.ready
  console.log('[Widget] ready!')
  _ready = true

  // Conectar eventos al store
  _widget.events.play.on(()  => { console.log('[Widget] event: play'); $playerStatus.set('playing') })
  _widget.events.pause.on(() => { console.log('[Widget] event: pause'); $playerStatus.set('paused') })
  _widget.events.ended.on(() => { console.log('[Widget] event: ended'); $playerStatus.set('ended') })
  _widget.events.error.on((e: unknown) => { console.error('[Widget] event: error', e); $playerStatus.set('idle') })
  _widget.events.progress.on((pos: number, dur: number) => {
    $progress.set(dur > 0 ? pos / dur : 0)
    $position.set(pos)
    $duration.set(dur)
  })

  return _widget
}

/**
 * Carga una pista en el widget y la reproduce.
 * Acepta cualquier Mixcloud key.
 */
export async function playTrack(track: PlayerTrack): Promise<void> {
  console.log('[Widget] playTrack called:', track.key)
  $playerStatus.set('loading')
  $currentTrack.set(track)

  const widget = await initWidget()
  const key = decodeURIComponent(track.key)
  console.log('[Widget] loading key:', key)
  await widget.load(key, false)
  console.log('[Widget] load complete, calling play...')
  widget.play()
  console.log('[Widget] play called')
}

/**
 * Salta a una posición en segundos.
 */
export async function seekTo(seconds: number): Promise<void> {
  const widget = await initWidget()
  widget.seek(seconds)
}

/**
 * Pausa o reanuda según el estado actual.
 */
export async function togglePlay(): Promise<void> {
  const widget = await initWidget()
  const status = $playerStatus.get()

  if (status === 'playing') {
    widget.pause()
  } else {
    widget.play()
  }
}
