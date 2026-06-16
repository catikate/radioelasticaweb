// ============================================================
// Radio Elástica — Calendario desde Google Sheet
// ============================================================

export interface CalendarSlot {
  fecha:        string   // "2026-04-22"
  inicio:       string   // "11:11"
  fin:          string   // "12:12"
  programa:     string
  residente:    string
  tagMixcloud:  string
  notas:        string
}

export async function getCalendar(): Promise<CalendarSlot[]> {
  const url = import.meta.env.CALENDAR_SHEET_URL
  if (!url) {
    console.warn('[Calendar] CALENDAR_SHEET_URL no definida')
    return []
  }

  try {
    const res = await fetch(url, {
      headers: { 'Cache-Control': 'max-age=3600' }
    })
    if (!res.ok) {
      console.error('[Calendar] Error fetching sheet:', res.status)
      return []
    }

    const csv = await res.text()
    return parseCSV(csv)
  } catch (err) {
    console.error('[Calendar] fetch failed:', err)
    return []
  }
}

function parseCSV(csv: string): CalendarSlot[] {
  const lines = csv.trim().split('\n')
  if (lines.length < 2) return []

  // Saltar la cabecera (fila 1)
  return lines
    .slice(1)
    .map(line => {
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
      const [fecha, inicio, fin, programa, residente, tagMixcloud, notas] = cols
      return { fecha, inicio, fin, programa, residente, tagMixcloud, notas: notas ?? '' }
    })
    .filter(s => s.fecha && s.programa) // ignorar filas vacías
    .sort((a, b) => {
      // Ordenar por fecha + hora de inicio
      const da = new Date(`${a.fecha}T${a.inicio}`)
      const db = new Date(`${b.fecha}T${b.inicio}`)
      return da.getTime() - db.getTime()
    })
}

// Agrupa los slots por fecha
export function groupByDate(slots: CalendarSlot[]): Record<string, CalendarSlot[]> {
  return slots.reduce((acc, slot) => {
    if (!acc[slot.fecha]) acc[slot.fecha] = []
    acc[slot.fecha].push(slot)
    return acc
  }, {} as Record<string, CalendarSlot[]>)
}

// Formatea "2026-04-22" → "miércoles 22 de abril"
export function formatFecha(fecha: string): string {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
  })
}

// Zona horaria de la emisora — las horas del Sheet son hora de Barcelona
const TZ = 'Europe/Madrid'

// Hora actual en Madrid como clave comparable "YYYY-MM-DDTHH:MM".
// Independiente del huso del servidor (la API corre en UTC).
function madridNowKey(): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: TZ,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(new Date()).map(x => [x.type, x.value])
  )
  const hour = p.hour === '24' ? '00' : p.hour  // Intl puede devolver "24" a medianoche
  return `${p.year}-${p.month}-${p.day}T${hour}:${p.minute}`
}

// Normaliza "9:5" → "09:05" para que la comparación lexicográfica sea válida
function normTime(t: string): string {
  const [h, m = '00'] = t.split(':')
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`
}

// Devuelve true si la fecha ya pasó
export function isPast(fecha: string, fin: string): boolean {
  return madridNowKey() >= `${fecha}T${normTime(fin)}`
}

// Devuelve true si está emitiendo ahora mismo
export function isNow(fecha: string, inicio: string, fin: string): boolean {
  const now = madridNowKey()
  return now >= `${fecha}T${normTime(inicio)}` && now < `${fecha}T${normTime(fin)}`
}
