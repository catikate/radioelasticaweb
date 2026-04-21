import { useEffect, useState } from 'react'
import { getEmisionState } from '@/lib/schedule'
import type { EmisionState } from '@/lib/types'

const MIXCLOUD_LIVE_URL = 'https://www.mixcloud.com/live/radioelastica/'

export default function PlayerBar() {
  const [emission, setEmission] = useState<EmisionState>(() => getEmisionState())

  useEffect(() => {
    const id = setInterval(() => setEmission(getEmisionState()), 30_000)
    return () => clearInterval(id)
  }, [])

  const isLive = emission === 'live'

  const label = isLive ? 'Escuchar en directo →' : 'Ir a Mixcloud →'

  return (
    <div
      class="fixed bottom-0 left-0 right-0 z-50
             bg-re-player border-t-2 border-re-blue"
    >
      <div class="flex items-center gap-4 px-5" style={{ height: '84px' }}>

        <img
          src="/assets/logo-square.jpg"
          alt="Radio Elástica"
          class="w-14 h-14 rounded-lg object-cover flex-shrink-0"
        />

        <div class="flex-1 min-w-0 flex items-center gap-3">
          {isLive ? (
            <>
              <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse inline-block flex-shrink-0" />
              <div class="min-w-0">
                <p class="text-base font-semibold text-white truncate">EN VIVO</p>
                <p class="text-sm text-white/60 truncate">Radio Elástica</p>
              </div>
            </>
          ) : (
            <div class="min-w-0">
              <p class="text-base font-semibold text-white truncate">Próxima emisión</p>
              <p class="text-sm text-white/60 truncate">miércoles 11:11</p>
            </div>
          )}
        </div>

        <a
          href={MIXCLOUD_LIVE_URL}
          target="_blank"
          rel="noopener noreferrer"
          class="flex-shrink-0 inline-flex items-center gap-1.5
                 text-xs sm:text-sm font-bold uppercase tracking-wider
                 text-white bg-re-blue hover:bg-blue-500
                 px-4 py-2.5 rounded-full transition-colors"
        >
          {label}
        </a>
      </div>
    </div>
  )
}
