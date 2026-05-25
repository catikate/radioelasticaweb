import { useState, useEffect, useRef } from 'react'
import { useStore } from '@nanostores/react'
import { startLivePolling, toggleLive } from '@/lib/liveAudio'
import type { CurrentShow } from '@/lib/liveAudio'
import { $liveStatus } from '@/lib/store'

const LIVE_H = '72px'

export default function LivePlayer() {
  const [isLive, setIsLive]           = useState(false)
  const [currentShow, setCurrentShow] = useState<CurrentShow | null>(null)
  const proxyUrl                      = useRef<string | null>(null)
  const liveStatus                    = useStore($liveStatus)

  useEffect(() => {
    startLivePolling((live, url, show) => {
      setIsLive(live)
      proxyUrl.current = url ?? null
      setCurrentShow(show ?? null)
    })
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty('--live-h', isLive ? LIVE_H : '0px')
  }, [isLive])

  function handlePlay() {
    if (proxyUrl.current) toggleLive(proxyUrl.current)
  }

  if (!isLive) return null

  return (
    <button
      onClick={handlePlay}
      aria-label="Escuchar en directo"
      className="fixed left-0 right-0 z-[45] bg-white border-b-2 border-re-blue font-display
                 flex items-center cursor-pointer hover:bg-gray-50 transition-colors w-full overflow-hidden"
      style={{ top: '0', height: LIVE_H }}
    >
      <div className="flex-1 min-w-0 text-left px-4 flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
        <span className="uppercase tracking-wider font-bold text-re-player text-xs">EN VIVO</span>
        {currentShow?.programa && (
          <span className="text-sm font-bold text-re-player truncate">— {currentShow.programa}</span>
        )}
      </div>
      <div className="flex-shrink-0 px-5">
        {liveStatus === 'loading'
          ? <span className="block w-5 h-5 border-2 border-re-player/30 border-t-re-player rounded-full animate-spin" />
          : liveStatus === 'playing'
          ? <svg className="w-5 h-5 text-re-player/60" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
            </svg>
          : <svg className="w-5 h-5 text-re-player/60" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
        }
      </div>
    </button>
  )
}
