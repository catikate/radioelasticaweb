import { useStore }   from '@nanostores/react'
import { useEffect }  from 'react'
import {
  $currentTrack,
  $playerStatus,
  $progress,
  $isLive,
} from '@/lib/store'
import { getEmisionState, minsUntilNext, formatCountdown, nextEmisionDate } from '@/lib/schedule'
import { initWidget, togglePlay } from '@/lib/widget'
import { PLAYER_COPY } from '@/lib/constants'

export default function PlayerBar() {
  const track   = useStore($currentTrack)
  const status  = useStore($playerStatus)
  const progress = useStore($progress)
  const isLive  = useStore($isLive)
  const emission = getEmisionState()

  // Inicializar el widget una sola vez al montar
  useEffect(() => {
    initWidget().catch(console.error)
  }, [])

  const isPlaying = status === 'playing'
  const isLoading = status === 'loading'

  // Qué mostrar según estado
  const copy = emission === 'live'
    ? PLAYER_COPY.live
    : emission === 'soon'
    ? { ...PLAYER_COPY.soon, subtitle: PLAYER_COPY.soon.subtitle(formatCountdown(minsUntilNext())) }
    : { ...PLAYER_COPY.offline, subtitle: PLAYER_COPY.offline.subtitle(nextEmisionDate()) }

  const displayTitle    = track ? track.title : copy.title
  const displaySubtitle = track ? track.dj    : copy.subtitle
  const displayCover    = track?.cover ?? '/assets/logo-square.jpg'

  return (
    <div
      class="fixed bottom-0 left-0 right-0 z-50 h-player
             bg-re-player border-t-2 border-re-blue
             flex items-center gap-3 px-4"
      style={{ height: '72px' }}
    >
      {/* Portada */}
      <img
        src={displayCover}
        alt={displayTitle}
        class="w-10 h-10 rounded-md object-cover flex-shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).src = '/assets/logo-square.jpg' }}
      />

      {/* Info */}
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-white truncate">{displayTitle}</p>
        <p class="text-xs text-white/40 mt-0.5 truncate">{displaySubtitle}</p>
      </div>

      {/* Barra de progreso — solo para episodios, no live */}
      {!isLive && track && (
        <div class="flex-1 max-w-[160px] hidden sm:block">
          <div class="h-0.5 bg-white/10 rounded-full">
            <div
              class="h-full bg-re-blue rounded-full transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Badge EN VIVO */}
      {isLive && emission === 'live' && (
        <span class="text-[10px] font-bold text-re-blue bg-re-blue/10
                     border border-re-blue/30 px-2 py-1 rounded-full
                     flex-shrink-0 hidden sm:flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-re-blue animate-pulse inline-block" />
          EN VIVO
        </span>
      )}

      {/* Badge OFFLINE / PRONTO */}
      {!track && emission !== 'live' && (
        <span class="text-[10px] font-bold text-white/30
                     border border-white/10 px-2 py-1 rounded-full
                     flex-shrink-0 hidden sm:block">
          {emission === 'soon' ? copy.badge : 'OFFLINE'}
        </span>
      )}

      {/* Botón play/pause */}
      <button
        onClick={togglePlay}
        disabled={isLoading || (!track && emission !== 'live')}
        aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
               transition-opacity disabled:opacity-30
               bg-re-blue hover:bg-blue-500"
      >
        {isLoading ? (
          <span class="w-3 h-3 border-2 border-white/30 border-t-white
                       rounded-full animate-spin" />
        ) : isPlaying ? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
            <rect x="1" y="1" width="3" height="8" rx="0.8"/>
            <rect x="6" y="1" width="3" height="8" rx="0.8"/>
          </svg>
        ) : (
          <svg width="10" height="11" viewBox="0 0 10 11" fill="white">
            <path d="M1 1l8 4.5-8 4.5V1z"/>
          </svg>
        )}
      </button>
    </div>
  )
}
