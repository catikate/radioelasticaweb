import { useState, useEffect } from 'react'
import { getEmisionState, minsUntilNext, formatCountdown, nextEmisionDate } from '@/lib/schedule'
import { playTrack }  from '@/lib/widget'
import { getLatestCloudcast } from '@/lib/mixcloud'
import { PLAYER_COPY } from '@/lib/constants'
import type { EmisionState } from '@/lib/types'

export default function OnAirStrip() {
  const [state, setState]         = useState<EmisionState>(getEmisionState)
  const [countdown, setCountdown] = useState(() => formatCountdown(minsUntilNext()))
  const [nextDate]                = useState(() => nextEmisionDate())

  useEffect(() => {
    const id = setInterval(() => {
      setState(getEmisionState())
      setCountdown(formatCountdown(minsUntilNext()))
    }, 30_000)
    return () => clearInterval(id)
  }, [])

  async function handlePlayLast() {
    const latest = await getLatestCloudcast()
    if (!latest) return
    playTrack({
      key:      latest.key,
      title:    latest.name,
      dj:       latest.user.name,
      cover:    latest.pictures['320wx320h'],
      duration: latest.audio_length,
      isLive:   false,
    })
  }

  if (state === 'live') {
    return (
      <div class="flex flex-col items-center gap-4">
        <span class="inline-flex items-center gap-2 text-[11px] font-bold
                     text-white bg-white/15 border border-white/30
                     px-3 py-1.5 rounded-full uppercase tracking-widest">
          <span class="w-2 h-2 rounded-full bg-white animate-pulse" />
          {PLAYER_COPY.live.badge}
        </span>
        <p class="text-white/70 text-sm">{PLAYER_COPY.live.subtitle}</p>
      </div>
    )
  }

  if (state === 'soon') {
    return (
      <div class="flex flex-col items-center gap-3">
        <span class="inline-flex items-center gap-2 text-[11px] font-bold
                     text-white/60 border border-white/20
                     px-3 py-1.5 rounded-full uppercase tracking-widest">
          {PLAYER_COPY.soon.badge}
        </span>
        <p class="text-white/50 text-sm">
          {PLAYER_COPY.soon.subtitle(countdown)}
        </p>
        <button
          onClick={handlePlayLast}
          class="mt-1 text-xs text-white/40 hover:text-white/70
                 underline underline-offset-2 transition-colors"
        >
          Escucha el último programa →
        </button>
      </div>
    )
  }

  // offline
  return (
    <div class="flex flex-col items-center gap-3">
      <span class="inline-flex items-center text-[11px] font-bold
                   text-white/30 border border-white/10
                   px-3 py-1.5 rounded-full uppercase tracking-widest">
        {PLAYER_COPY.offline.badge}
      </span>
      <p class="text-white/40 text-sm">
        {PLAYER_COPY.offline.subtitle(nextDate)}
      </p>
      <button
        onClick={handlePlayLast}
        class="mt-1 text-xs text-white/40 hover:text-white/70
               underline underline-offset-2 transition-colors"
      >
        Escucha el último programa →
      </button>
    </div>
  )
}
