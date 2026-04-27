import { useRef, useState, useEffect } from 'react'
import { MIXCLOUD_USER } from '@/lib/constants'

const LIVE_STREAM_URL = `https://stream.mixcloud.com/live/${MIXCLOUD_USER}/`
const LIVE_STATUS_URL = `https://api.mixcloud.com/${MIXCLOUD_USER}/live/`

export default function LivePlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isLive,  setIsLive]  = useState(false)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    async function checkLive() {
      try {
        const res = await fetch(LIVE_STATUS_URL)
        setIsLive(res.ok)
      } catch {
        setIsLive(false)
      }
    }
    checkLive()
    const id = setInterval(checkLive, 60_000)
    return () => clearInterval(id)
  }, [])

  // Empuja el FAB hacia arriba cuando el banner en vivo está visible
  useEffect(() => {
    const fab = document.getElementById('home-fab')
    if (!fab) return
    fab.style.bottom = isLive ? '148px' : ''
  }, [isLive])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onPlay    = () => { setPlaying(true);  setLoading(false) }
    const onPause   = () => setPlaying(false)
    const onWaiting = () => setLoading(true)
    const onError   = () => { setError(true); setLoading(false); setPlaying(false) }
    audio.addEventListener('play',    onPlay)
    audio.addEventListener('pause',   onPause)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('error',   onError)
    return () => {
      audio.removeEventListener('play',    onPlay)
      audio.removeEventListener('pause',   onPause)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('error',   onError)
    }
  }, [])

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      setError(false)
      setLoading(true)
      audio.src = `${LIVE_STREAM_URL}?t=${Date.now()}`
      audio.load()
      audio.play().catch(() => setError(true))
    }
  }

  if (!isLive) return null

  return (
    <div
      className="fixed left-0 right-0 z-[45] bg-re-blue border-t border-white/20"
      style={{ bottom: '84px', height: '52px' }}
    >
      <audio ref={audioRef} preload="none" />
      <div className="h-full flex items-center gap-3 px-5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-white">EN VIVO</p>
          <p className="text-sm text-white/80 truncate">Radio Elástica</p>
        </div>
        {error && <span className="text-xs text-white/60">Sin señal</span>}
        <button
          onClick={toggle}
          aria-label={playing ? 'Pausar' : 'Escuchar en directo'}
          className="flex-shrink-0 inline-flex items-center
                     text-xs font-bold uppercase tracking-wider
                     text-re-blue bg-white hover:bg-white/90
                     px-4 py-2 rounded-full transition-colors"
        >
          {loading ? (
            <span className="w-3 h-3 border-2 border-re-blue/30 border-t-re-blue rounded-full animate-spin" />
          ) : playing ? 'Pausar' : 'Escuchar'}
        </button>
      </div>
    </div>
  )
}
