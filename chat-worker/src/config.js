// Configuración editable del chat.

// Orígenes que pueden abrir el WebSocket (cabecera Origin).
export const ALLOWED_ORIGINS = [
  'https://radioelastica.com',
  'https://www.radioelastica.com',
  // TODO: sustituir por el dominio real de Netlify (p. ej. https://radioelastica.netlify.app)
  'https://radioelastica.netlify.app',
  // Desarrollo local (astro dev / preview)
  'http://localhost:4321',
  'http://localhost:4322',
  'http://127.0.0.1:4321',
]

export const NICK_MIN = 2
export const NICK_MAX = 20
export const TEXT_MAX = 300
export const HISTORY_SIZE = 50

// Límite por conexión: separación mínima y ráfaga máxima por ventana.
export const RATE_MIN_GAP_MS = 1000
export const RATE_WINDOW_MS = 30_000
export const RATE_MAX_IN_WINDOW = 10

// Filtro simple de palabras (minúsculas, sin tildes). Coincide por palabra
// completa. Añade o quita a tu gusto; los mensajes con estas palabras se rechazan.
export const BAD_WORDS = [
  'puta', 'puto', 'mierda', 'cabron', 'gilipollas', 'subnormal',
  'nazi', 'fuck', 'shit', 'bitch',
]
