// ============================================================
// Radio Elástica — Singleton del stream en vivo
// El <audio id="live-audio"> vive en Base.astro con transition:persist.
// Acá se controla y se publica su estado en nanostores.
// React solo lee los stores y llama a toggleLive().
// ============================================================

import { MIXCLOUD_USER } from './constants'
import { $liveOnAir, $liveStatus } from './store'

const LIVE_STREAM_URL = `https://stream.mixcloud.com/live/${MIXCLOUD_USER}/`
const LIVE_STATUS_URL = `https://api.mixcloud.com/${MIXCLOUD_USER}/live/`
const POLL_MS = 60_000

let _audio: HTMLAudioElement | null = null
let _bound = false
let _pollId: ReturnType<typeof setInterval> | null = null

function getAudio(): HTMLAudioElement | null {
  if (_audio) return _audio
  const el = document.getElementById('live-audio') as HTMLAudioElement | null
  if (!el) return null
  _audio = el

  if (!_bound) {
    el.addEventListener('play',    () => $liveStatus.set('playing'))
    el.addEventListener('pause',   () => $liveStatus.set('paused'))
    el.addEventListener('waiting', () => $liveStatus.set('loading'))
    el.addEventListener('error',   () => $liveStatus.set('error'))
    _bound = true
  }
  return el
}

async function checkLive() {
  try {
    const res = await fetch(LIVE_STATUS_URL)
    $liveOnAir.set(res.ok)
  } catch {
    $liveOnAir.set(false)
  }
}

export function startLivePolling() {
  getAudio()
  if (_pollId) return
  checkLive()
  _pollId = setInterval(checkLive, POLL_MS)
}

export function toggleLive() {
  const a = getAudio()
  if (!a) return

  if (!a.paused) {
    a.pause()
    return
  }

  $liveStatus.set('loading')
  a.src = `${LIVE_STREAM_URL}?t=${Date.now()}`
  a.load()
  a.play().catch(() => $liveStatus.set('error'))
}
