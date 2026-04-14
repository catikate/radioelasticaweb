// ============================================================
// Radio Elástica — Store global del reproductor
// Solo el reproductor tiene estado global.
// Todo lo demás es estado local o props.
// ============================================================

import { atom, computed } from 'nanostores'
import type { PlayerTrack, PlayerStatus } from './types'

// Qué está cargado en el widget
export const $currentTrack = atom<PlayerTrack | null>(null)

// Estado de reproducción
export const $playerStatus = atom<PlayerStatus>('idle')

// Progreso de 0 a 1
export const $progress = atom<number>(0)

// Volumen de 0 a 1
export const $volume = atom<number>(0.8)

// Derivados
export const $isLive    = computed($currentTrack, t => t?.isLive ?? false)
export const $isPlaying = computed($playerStatus, s => s === 'playing')
export const $isLoading = computed($playerStatus, s => s === 'loading')
