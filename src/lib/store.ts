// ============================================================
// Radio Elástica — Store global del reproductor
// Solo el reproductor tiene estado global.
// Todo lo demás es estado local o props.
// ============================================================

import { atom, computed } from 'nanostores'
import type { PlayerTrack, PlayerStatus } from './types'

// Qué está cargado en el widget
export const $currentTrack = atom<PlayerTrack | null>(null)

// Emisión en vivo
export const $liveOnAir  = atom<boolean>(false)
export const $liveStatus = atom<PlayerStatus>('idle')

// Qué reproductor está activo
export const $activePlayer = atom<'archive' | 'live' | null>(null)

// Derivados
export const $isPlaying = computed($liveStatus, s => s === 'playing')
