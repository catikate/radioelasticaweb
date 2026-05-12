import { useState, useEffect, useRef } from 'react'
import { useStore } from '@nanostores/react'
import { startLivePolling, toggleLive } from '@/lib/liveAudio'
import { $liveStatus } from '@/lib/store'

export default function LivePlayer() {
  const [isLive, setIsLive]     = useState(false)
  const proxyUrl                = useRef<string | null>(null)
  const liveStatus              = useStore($liveStatus)

  useEffect(() => {
    startLivePolling((live, url) => {
      setIsLive(live)
      proxyUrl.current = url ?? null
    })
  }, [])

  useEffect(() => {
    const fab = document.getElementById('home-fab')
    if (!fab) return
    fab.style.bottom = isLive ? '148px' : ''
  }, [isLive])

  function handlePlay() {
    if (proxyUrl.current) toggleLive(proxyUrl.current)
  }

  if (!isLive) return null

  return (
    <button
      onClick={handlePlay}
      aria-label="Escuchar en directo"
      className="fixed left-0 right-0 z-[45] bg-re-player border-t-2 border-re-blue
                 flex items-center gap-3 px-5 cursor-pointer
                 hover:bg-white/10 transition-colors w-full"
      style={{ bottom: '84px', height: '52px' }}
    >
      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
      <div className="flex-1 min-w-0 text-left">
        <p className="text-xs font-bold uppercase tracking-wider text-white">EN VIVO</p>
        <p className="text-sm font-bold text-white truncate">
          {liveStatus === 'playing' ? 'Radio Elástica — click para pausar' : 'Radio Elástica — click para escuchar'}
        </p>
      </div>
      {liveStatus === 'loading'
        ? <span className="flex-shrink-0 w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        : liveStatus === 'playing'
        ? <svg className="flex-shrink-0 w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
          </svg>
        : <svg className="flex-shrink-0 w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
      }
    </button>
  )
}
