import Hls from 'hls.js'
import { $liveOnAir, $liveStatus } from './store'

let _audio: HTMLAudioElement | null = null
let _hls:   Hls | null = null
let _bound  = false
let _pollId: ReturnType<typeof setInterval> | null = null

function getAudio(): HTMLAudioElement | null {
  if (_audio) return _audio
  const el = document.getElementById('live-audio') as HTMLAudioElement | null
  if (!el) return null
  _audio = el
  if (!_bound) {
    el.addEventListener('play',    () => $liveStatus.set('playing'))
    el.addEventListener('pause',   () => $liveStatus.set('paused'))
    el.addEventListener('waiting', () => {
      if ($liveStatus.get() !== 'playing') $liveStatus.set('loading')
    })
    el.addEventListener('error',   () => $liveStatus.set('error'))
    _bound = true
  }
  return el
}

export interface CurrentShow {
  programa:  string
  residente: string
}

export function startLivePolling(onStatus: (live: boolean, proxyUrl?: string, currentShow?: CurrentShow | null) => void) {
  getAudio()
  if (_pollId) return

  async function poll() {
    if (document.visibilityState === 'hidden') return
    try {
      const res  = await fetch('/api/live-url')
      const data = await res.json()
      $liveOnAir.set(data.isLive === true)
      onStatus(data.isLive === true, data.proxyUrl, data.currentShow ?? null)
    } catch {
      $liveOnAir.set(false)
      onStatus(false)
    }
  }

  poll()
  _pollId = setInterval(poll, 5 * 60_000)
}

function pauseMixcloudWidget() {
  const iframe = document.getElementById('mc-widget') as HTMLIFrameElement | null
  iframe?.contentWindow?.postMessage(JSON.stringify({ method: 'pause' }), '*')
}

export function stopLive() {
  if (_hls) {
    _hls.detachMedia()
    _hls.destroy()
    _hls = null
  }
  const a = _audio
  if (a) {
    a.pause()
    a.removeAttribute('src')
    a.load()
  }
  $liveStatus.set('idle')
}

export function toggleLive(proxyUrl: string) {
  const a = getAudio()
  if (!a) return

  const status = $liveStatus.get()
  if (status === 'playing' || status === 'loading') {
    stopLive()
    return
  }

  $liveStatus.set('loading')

  if (Hls.isSupported()) {
    _hls?.destroy()
    _hls = new Hls({ lowLatencyMode: true })
    _hls.loadSource(proxyUrl)
    _hls.attachMedia(a)
    _hls.on(Hls.Events.MANIFEST_PARSED, () => {
      pauseMixcloudWidget()
      a.play().catch(() => $liveStatus.set('error'))
    })
    _hls.on(Hls.Events.ERROR, (_e, data) => {
      if (data.fatal) $liveStatus.set('error')
    })
  } else if (a.canPlayType('application/vnd.apple.mpegurl')) {
    a.src = proxyUrl
    a.load()
    pauseMixcloudWidget()
    a.play().catch(() => $liveStatus.set('error'))
  } else {
    $liveStatus.set('error')
  }
}
