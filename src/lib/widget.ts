import type { WidgetPlayer, PlayerTrack } from './types'
import {
  $currentTrack,
  $playerStatus,
  $progress,
  $position,
  $duration,
} from './store'

let _widget: WidgetPlayer | null = null
let _initializing: Promise<WidgetPlayer> | null = null

export async function initWidget(): Promise<WidgetPlayer> {
  if (_widget) return _widget
  if (_initializing) return _initializing

  _initializing = new Promise((resolve, reject) => {
    const iframe = document.getElementById('mc-widget') as HTMLIFrameElement | null

    if (!iframe) {
      reject(new Error('[Widget] mc-widget iframe not found'))
      return
    }

    const widget = window.Mixcloud.PlayerWidget(iframe)

    widget.ready.then(() => {
      console.log('[Widget] Ready')

      widget.events.play.on(() => {
        $playerStatus.set('playing')
      })

      widget.events.pause.on(() => {
        $playerStatus.set('paused')
      })

      widget.events.ended.on(() => {
        $playerStatus.set('ended')
      })

      widget.events.error.on((error: unknown) => {
        console.error('[Widget] Error:', error)
        $playerStatus.set('idle')
      })

      widget.events.progress.on((pos: number, dur: number) => {
        $progress.set(dur > 0 ? pos / dur : 0)
        $position.set(pos)
        $duration.set(dur)
      })

      _widget = widget
      resolve(widget)
    }).catch(reject)
  })

  return _initializing
}

function normalizeMixcloudKey(input: string): string {
  try {
    const url = new URL(input)
    return url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`
  } catch {
    let key = input.trim()
    if (!key.startsWith('/')) key = `/${key}`
    if (!key.endsWith('/')) key = `${key}/`
    return key
  }
}

export async function playTrack(track: PlayerTrack): Promise<void> {
  const widget = await initWidget()
  const key = normalizeMixcloudKey(track.key)

  console.log('[Widget] Loading track:', key)

  $playerStatus.set('loading')
  $currentTrack.set(track)
  $progress.set(0)
  $position.set(0)
  $duration.set(0)

  widget.load(key, true)
}

export async function seekTo(seconds: number): Promise<void> {
  const widget = await initWidget()
  widget.seek(seconds)
}

export async function togglePlay(): Promise<void> {
  const widget = await initWidget()
  const status = $playerStatus.get()

  if (status === 'playing') {
    widget.pause()
  } else {
    widget.play()
  }
}
