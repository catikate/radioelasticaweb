// ============================================================
// Radio Elástica — Lógica de parrilla de emisión
// ============================================================

import { EMISSION } from './constants'
import type { EmisionState } from './types'

// Primera emisión: miércoles 22 de abril de 2026, 11:11
const FIRST_EMISSION = new Date('2026-04-22T11:11:00')

/**
 * Devuelve el estado actual de la emisión.
 * 'live'    → miércoles 11:11–13:13
 * 'soon'    → miércoles antes de las 11:11
 * 'offline' → resto de la semana
 *
 * Antes de la primera emisión siempre devuelve 'offline'.
 */
export function getEmisionState(): EmisionState {
  const now  = new Date()

  if (now < FIRST_EMISSION) return 'offline'

  const day  = now.getDay()
  const mins = now.getHours() * 60 + now.getMinutes()

  if (day === EMISSION.DAY && mins >= EMISSION.START_MINS && mins < EMISSION.END_MINS) {
    return 'live'
  }
  if (day === EMISSION.DAY && mins < EMISSION.START_MINS) {
    return 'soon'
  }
  return 'offline'
}

/**
 * Minutos hasta el próximo inicio de emisión.
 */
export function minsUntilNext(): number {
  const now     = new Date()
  const today   = now.getDay()
  const nowMins = now.getHours() * 60 + now.getMinutes()

  let daysUntil = (EMISSION.DAY - today + 7) % 7

  // Miércoles pero ya terminó → esperar al siguiente
  if (daysUntil === 0 && nowMins >= EMISSION.END_MINS) daysUntil = 7

  // Miércoles y aún no empezó
  if (daysUntil === 0 && nowMins < EMISSION.START_MINS) {
    return EMISSION.START_MINS - nowMins
  }

  return daysUntil * 24 * 60 + (EMISSION.START_MINS - nowMins)
}

/**
 * Formatea minutos como "2d 3h", "1h 23min" o "14min"
 */
export function formatCountdown(totalMins: number): string {
  const d = Math.floor(totalMins / (60 * 24))
  const h = Math.floor((totalMins % (60 * 24)) / 60)
  const m = Math.round(totalMins % 60)

  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}

/**
 * Fecha del próximo miércoles de emisión en formato legible.
 * Antes de la primera emisión devuelve "miércoles 22 de abril".
 */
export function nextEmisionDate(): string {
  const now = new Date()

  if (now < FIRST_EMISSION) {
    return FIRST_EMISSION.toLocaleDateString('es-ES', {
      weekday: 'long',
      day:     'numeric',
      month:   'long',
    })
  }

  const days = (EMISSION.DAY - now.getDay() + 7) % 7 || 7
  const next = new Date(now)
  next.setDate(now.getDate() + days)
  return next.toLocaleDateString('es-ES', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
  })
}
