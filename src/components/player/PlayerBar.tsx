import { useStore } from '@nanostores/react'
import { useRef, useCallback } from 'react'
import {
  $currentTrack,
  $playerStatus,
  $progress,
  $position,
  $duration,
} from '@/lib/store'
import { togglePlay, seekTo } from '@/lib/widget'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function PlayerBar() {
  const track    = useStore($currentTrack)
  const status   = useStore($playerStatus)
  const progress = useStore($progress)
  const position = useStore($position)
  const duration = useStore($duration)
  const barRef        = useRef<HTMLDivElement>(null)
  const stableDuration = useRef<number>(0)
  if (duration > 0) stableDuration.current = duration
  const effectiveDuration = duration > 0 ? duration : stableDuration.current

  const isPlaying = status === 'playing'
  const isLoading = status === 'loading'

  const displayTitle    = track ? track.title : 'Selecciona un programa'
  const displaySubtitle = track ? track.dj    : ''
  const displayCover    = track?.cover ?? '/assets/logo-square.jpg'

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current || !effectiveDuration) return
    const rect = barRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    seekTo(ratio * effectiveDuration)
  }, [effectiveDuration])

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50
             bg-re-player border-t-2 border-re-blue"
    >
      {/* Barra de progreso clicable — solo para episodios */}
      {track && effectiveDuration > 0 && (
        <div
          ref={barRef}
          onClick={handleSeek}
          className="w-full cursor-pointer flex items-center group"
          style={{ height: '16px' }}
        >
          <div className="w-full h-1 group-hover:h-2 bg-white/10 transition-all relative rounded-r-full">
            <div
              className="absolute inset-y-0 left-0 bg-white rounded-r-full pointer-events-none"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Contenido del reproductor */}
      <div className="flex items-center gap-4 px-5" style={{ height: '84px' }}>

        {/* Portada */}
        <img
          src={displayCover}
          alt={displayTitle}
          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/logo-square.jpg' }}
        />

        {/* Info + tiempo */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-white truncate">{displayTitle}</p>
          <div className="flex items-center gap-2 mt-1">
            {track && effectiveDuration > 0 ? (
              <span className="text-sm text-white/40 tabular-nums">
                {formatTime(position)} / {formatTime(effectiveDuration)}
              </span>
            ) : displaySubtitle ? (
              <span className="text-sm text-white/40 truncate">{displaySubtitle}</span>
            ) : null}
          </div>
        </div>

        {/* Botón play/pause */}
        <button
          onClick={togglePlay}
          disabled={isLoading || !track}
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center
                 transition-opacity disabled:opacity-30
                 bg-re-blue hover:bg-blue-500"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white
                         rounded-full animate-spin" />
          ) : isPlaying ? (
            <svg width="12" height="12" viewBox="0 0 10 10" fill="white">
              <rect x="1" y="1" width="3" height="8" rx="0.8"/>
              <rect x="6" y="1" width="3" height="8" rx="0.8"/>
            </svg>
          ) : (
            <svg width="12" height="13" viewBox="0 0 10 11" fill="white">
              <path d="M1 1l8 4.5-8 4.5V1z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
