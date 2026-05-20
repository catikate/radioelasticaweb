import { $activePlayer } from './store'

let archiveWidget: ReturnType<typeof window.Mixcloud.PlayerWidget> | null = null
let liveWidget:    ReturnType<typeof window.Mixcloud.PlayerWidget> | null = null

function initWidget(
  id: string,
  onPlay: () => void,
): ReturnType<typeof window.Mixcloud.PlayerWidget> | null {
  const iframe = document.getElementById(id) as HTMLIFrameElement | null
  if (!iframe) return null
  const widget = window.Mixcloud.PlayerWidget(iframe)
  widget.ready.then(() => {
    widget.events.play.on(onPlay)
  })
  return widget
}

export function initPlayback(): void {
  archiveWidget = initWidget('mc-widget', () => {
    liveWidget?.pause()
    $activePlayer.set('archive')
  })
  liveWidget = initWidget('mc-live', () => {
    archiveWidget?.pause()
    $activePlayer.set('live')
  })
}

export function playArchive(key: string): void {
  archiveWidget?.load(key, true)
}

export function toggleLive(): void {
  if ($activePlayer.get() === 'live') {
    liveWidget?.pause()
    $activePlayer.set(null)
  } else {
    liveWidget?.play()
  }
}
