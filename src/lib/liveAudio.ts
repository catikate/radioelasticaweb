import type Hls from 'hls.js'
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

function playNative(a: HTMLAudioElement, proxyUrl: string) {
  a.src = proxyUrl
  a.load()
  pauseMixcloudWidget()
  a.play().catch(() => $liveStatus.set('error'))
}

export async function toggleLive(proxyUrl: string) {
  const a = getAudio()
  if (!a) return

  const status = $liveStatus.get()
  if (status === 'playing' || status === 'loading') {
    stopLive()
    return
  }

  $liveStatus.set('loading')

  const canNative = a.canPlayType('application/vnd.apple.mpegurl') !== ''

  // Sin MediaSource hls.js no puede funcionar (p. ej. iPhone antiguo): vamos
  // directos al HLS nativo sin descargar la librería ni perder el gesto del usuario.
  if (canNative && !('MediaSource' in window) && !('ManagedMediaSource' in window)) {
    playNative(a, proxyUrl)
    return
  }

  // hls.js (~520 KB) solo se descarga al pulsar play en el directo.
  let HlsLib: typeof Hls
  try {
    HlsLib = (await import('hls.js')).default
  } catch {
    $liveStatus.set('error')
    return
  }
  // Si pulsaron stop mientras cargaba la librería, no arrancamos.
  if ($liveStatus.get() !== 'loading') return

  if (HlsLib.isSupported()) {
    _hls?.destroy()
    _hls = new HlsLib({ lowLatencyMode: true })
    _hls.loadSource(proxyUrl)
    _hls.attachMedia(a)
    _hls.on(HlsLib.Events.MANIFEST_PARSED, () => {
      pauseMixcloudWidget()
      a.play().catch(() => $liveStatus.set('error'))
    })
    _hls.on(HlsLib.Events.ERROR, (_e, data) => {
      if (data.fatal) $liveStatus.set('error')
    })
  } else if (canNative) {
    playNative(a, proxyUrl)
  } else {
    $liveStatus.set('error')
  }
}
