import { useState, useEffect } from 'react'
import { playTrack } from '@/lib/widget'
import { liveKey } from '@/lib/mixcloud'
import { MIXCLOUD_USER } from '@/lib/constants'

const LIVE_STATUS_URL = `https://api.mixcloud.com/${MIXCLOUD_USER}/live/`

export default function LivePlayer() {
  const [isLive, setIsLive] = useState(false)

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

  function handlePlay() {
    playTrack({
      key:      liveKey(),
      title:    'Radio Elástica — En Vivo',
      dj:       '',
      cover:    '/assets/logo-square.jpg',
      duration: 0,
      isLive:   true,
    })
  }

  if (!isLive) return null

  return (
    <div
      className="fixed left-0 right-0 z-[45] bg-re-blue border-t border-white/20"
      style={{ bottom: '84px', height: '52px' }}
    >
      <div className="h-full flex items-center gap-3 px-5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-white">EN VIVO</p>
          <p className="text-sm text-white/80 truncate">Radio Elástica</p>
        </div>
        <button
          onClick={handlePlay}
          aria-label="Escuchar en directo"
          className="flex-shrink-0 inline-flex items-center
                     text-xs font-bold uppercase tracking-wider
                     text-re-blue bg-white hover:bg-white/90
                     px-4 py-2 rounded-full transition-colors"
        >
          Escuchar
        </button>
      </div>
    </div>
  )
}
