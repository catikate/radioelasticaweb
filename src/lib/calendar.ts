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

// Devuelve true si la fecha ya pasó
export function isPast(fecha: string, fin: string): boolean {
  return new Date(`${fecha}T${fin}`) < new Date()
}

// Devuelve true si está emitiendo ahora mismo
export function isNow(fecha: string, inicio: string, fin: string): boolean {
  const now = new Date()
  return now >= new Date(`${fecha}T${inicio}`) && now < new Date(`${fecha}T${fin}`)
}
