import { BAD_WORDS } from './config.js'

// Quita etiquetas HTML, caracteres de control y espacios sobrantes.
// (El cliente además usa textContent, nunca innerHTML.)
export function clean(s) {
  return String(s ?? '')
    .replace(/<[^>]*>?/g, '')
    .replace(/[\u0000-\u001F\u007F\u200B-\u200F\u2028-\u202E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
const BAD = new Set(BAD_WORDS.map(norm))

export function hasBadWord(s) {
  return norm(s).split(/[^a-z0-9ñ]+/).some((w) => w && BAD.has(w))
}

export const nickKey = (nick) => norm(nick)
