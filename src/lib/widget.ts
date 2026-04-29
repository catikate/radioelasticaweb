import type { PlayerTrack } from './types'
import { $currentTrack } from './store'
import { widgetSrc } from './mixcloud'

export function playTrack(track: PlayerTrack): void {
  $currentTrack.set(track)
  const iframe = document.getElementById('mc-widget') as HTMLIFrameElement | null
  if (iframe) {
    iframe.src = widgetSrc(track.key, true)
  }
}
