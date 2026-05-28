import type { PlayerTrack } from './types'
import { $currentTrack } from './store'
import { widgetSrc } from './mixcloud'
import { stopLive } from './liveAudio'

export function playTrack(track: PlayerTrack): void {
  stopLive()
  $currentTrack.set(track)
  const iframe = document.getElementById('mc-widget') as HTMLIFrameElement | null
  if (iframe) {
    iframe.src = widgetSrc(track.key, true)
  }
}
