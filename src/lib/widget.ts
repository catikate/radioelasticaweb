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

  _widget = window.Mixcloud.PlayerWidget(iframe)
  await _widget.ready
  _ready = true

  // Conectar eventos al store
  _widget.events.play.on(()  => $playerStatus.set('playing'))
  _widget.events.pause.on(() => $playerStatus.set('paused'))
  _widget.events.ended.on(() => $playerStatus.set('ended'))
  _widget.events.error.on(() => $playerStatus.set('idle'))
  _widget.events.progress.on((pos: number, dur: number) => {
    $progress.set(dur > 0 ? pos / dur : 0)
  })

  return _widget
}

/**
 * Carga una pista en el widget y la reproduce.
 * Acepta cualquier Mixcloud key.
 */
export async function playTrack(track: PlayerTrack): Promise<void> {
  $playerStatus.set('loading')
  $currentTrack.set(track)

  const widget = await initWidget()
  await widget.load(track.key, true)
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
