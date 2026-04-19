import { useStore }   from '@nanostores/react'
import { useEffect, useRef, useCallback, useState }  from 'react'
import {
  $currentTrack,
  $playerStatus,
  $progress,
  $position,
  $duration,
  $isLive,
} from '@/lib/store'
import { getEmisionState, minsUntilNext, formatCountdown, nextEmisionDate } from '@/lib/schedule'
import { initWidget, togglePlay, seekTo, goLive } from '@/lib/widget'
import { PLAYER_COPY } from '@/lib/constants'
import type { EmisionState } from '@/lib/types'

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
  const isLive   = useStore($isLive)
  const [emission, setEmission] = useState<EmisionState>(() => getEmisionState())
  const barRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initWidget().catch(console.error)
  }, [])

  // Re-evaluar estado de emisión cada 30s — para que el player pase a "EN VIVO"
  // sin necesidad de recargar la página al llegar la hora.
  useEffect(() => {
    const id = setInterval(() => setEmission(getEmisionState()), 30_000)
    return () => clearInterval(id)
  }, [])

  const isPlaying = status === 'playing'
  const isLoading = status === 'loading'

  const copy = emission === 'live'
    ? PLAYER_COPY.live
    : emission === 'soon'
    ? { ...PLAYER_COPY.soon, subtitle: PLAYER_COPY.soon.subtitle(formatCountdown(minsUntilNext())) }
    : { ...PLAYER_COPY.offline, subtitle: PLAYER_COPY.offline.subtitle(nextEmisionDate()) }

  const displayTitle    = track ? track.title : copy.title
  const displaySubtitle = track ? track.dj    : copy.subtitle
  const displayCover    = track?.cover ?? '/assets/logo-square.jpg'

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current || !duration) return
    const rect = barRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    seekTo(ratio * duration)
  }, [duration])

  return (
    <div
      class="fixed bottom-0 left-0 right-0 z-50
             bg-re-player border-t-2 border-re-blue"
    >
      {/* Barra de progreso clicable — solo para episodios */}
      {!isLive && track && duration > 0 && (
        <div
          ref={barRef}
          onClick={handleSeek}
          class="w-full h-1.5 bg-white/10 cursor-pointer group hover:h-2.5 transition-all"
        >
          <div
            class="h-full bg-white rounded-r-full transition-all duration-300
                   group-hover:bg-white/80"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {/* Contenido del reproductor */}
      <div class="flex items-center gap-4 px-5" style={{ height: '84px' }}>

        {/* Portada */}
        <img
          src={displayCover}
          alt={displayTitle}
          class="w-14 h-14 rounded-lg object-cover flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/logo-square.jpg' }}
        />

        {/* Info + tiempo */}
        <div class="flex-1 min-w-0">
          <p class="text-base font-semibold text-white truncate">{displayTitle}</p>
          <div class="flex items-center gap-2 mt-1">
            {track && duration > 0 ? (
              <span class="text-sm text-white/40 tabular-nums">
                {formatTime(position)} / {formatTime(duration)}
              </span>
            ) : (
              <span class="text-sm text-white/40 truncate">{displaySubtitle}</span>
            )}
          </div>
        </div>

        {/* Botón VOLVER AL VIVO — cuando hay emisión pero escucha grabado */}
        {emission === 'live' && track && !isLive && (
          <button
            onClick={goLive}
            class="flex-shrink-0 inline-flex items-center gap-1.5
                   text-xs font-bold uppercase tracking-wider
                   text-white bg-red-500/80 hover:bg-red-500
                   px-3 py-1.5 rounded-full transition-colors"
          >
            <span class="w-2 h-2 rounded-full bg-white animate-pulse inline-block" />
            En vivo
          </button>
        )}

        {/* Badge EN VIVO — siempre que haya emisión en directo (aunque no esté sonando aún) */}
        {emission === 'live' && !(track && !isLive) && (
          <span class="text-xs font-bold text-re-blue bg-re-blue/10
                       border border-re-blue/30 px-3 py-1.5 rounded-full
                       flex-shrink-0 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-re-blue animate-pulse inline-block" />
            EN VIVO
          </span>
        )}

        {/* Badge OFFLINE / PRONTO */}
        {!track && emission !== 'live' && (
          <span class="text-xs font-bold text-white/30
                       border border-white/10 px-3 py-1.5 rounded-full
                       flex-shrink-0 hidden sm:block">
            {emission === 'soon' ? copy.badge : 'OFFLINE'}
          </span>
        )}

        {/* Botón play/pause */}
        <button
          onClick={togglePlay}
          disabled={isLoading || (!track && emission !== 'live')}
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center
                 transition-opacity disabled:opacity-30
                 bg-re-blue hover:bg-blue-500"
        >
          {isLoading ? (
            <span class="w-4 h-4 border-2 border-white/30 border-t-white
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
