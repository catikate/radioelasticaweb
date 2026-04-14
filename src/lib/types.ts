// ============================================================
// Radio Elástica — Tipos globales
// Todos los tipos del proyecto viven aquí.
// ============================================================

// ------------------------------------------------------------
// Mixcloud API
// ------------------------------------------------------------

export interface Cloudcast {
  key:          string          // "/radioelastica/late-night-session-01/"
  name:         string
  slug:         string
  url:          string          // URL en mixcloud.com
  audio_length: number          // segundos
  created_time: string          // ISO 8601
  play_count:   number
  pictures: {
    medium:      string
    large:       string
    '320wx320h': string
  }
  user: {
    username: string
    name:     string
    pictures: { medium: string }
  }
  tags: { name: string }[]
}

export interface MixcloudUser {
  username:        string
  name:            string
  biog:            string
  cloudcast_count: number
  pictures: {
    medium:      string
    large:       string
    '320wx320h': string
  }
  url: string
}

export interface MixcloudResponse<T> {
  data:    T[]
  paging?: {
    next?:     string
    previous?: string
  }
}

// ------------------------------------------------------------
// Reproductor
// ------------------------------------------------------------

export interface PlayerTrack {
  key:      string    // Mixcloud key
  title:    string
  dj:       string
  cover:    string    // URL portada
  duration: number    // segundos (0 si es live)
  isLive:   boolean
}

export type PlayerStatus =
  | 'idle'       // nada cargado
  | 'loading'    // cargando
  | 'playing'    // reproduciendo
  | 'paused'     // pausado
  | 'ended'      // terminó

// ------------------------------------------------------------
// Emisión en vivo
// ------------------------------------------------------------

export type EmisionState =
  | 'live'       // miércoles 11:11–13:13
  | 'soon'       // miércoles antes de las 11:11
  | 'offline'    // resto de la semana

// ------------------------------------------------------------
// Contenido de la web
// ------------------------------------------------------------

// Un residente o guest, construido a partir de los tags de Mixcloud
export interface Residente {
  slug:        string   // tag usado en Mixcloud (ej: "residente-marta")
  name:        string   // nombre para mostrar
  bio?:        string
  cover?:      string   // foto de perfil
  isGuest:     boolean
  cloudcasts?: Cloudcast[]
}

// Un programa (serie), construido a partir de los tags de Mixcloud
export interface Programa {
  slug:        string   // tag usado en Mixcloud (ej: "late-night")
  name:        string   // nombre para mostrar
  description?: string
  cover?:      string
  cloudcasts?: Cloudcast[]
}

// Declaración global del widget de Mixcloud
declare global {
  interface Window {
    Mixcloud: {
      PlayerWidget: (iframe: HTMLIFrameElement) => WidgetPlayer
    }
  }
}

export interface WidgetPlayer {
  ready:    Promise<void>
  load:     (key: string, autoplay: boolean) => Promise<void>
  play:     () => void
  pause:    () => void
  seek:     (seconds: number) => void
  getPosition: () => Promise<number>
  getDuration: () => Promise<number>
  getVolume:   () => Promise<number>
  setVolume:   (v: number) => void
  events: {
    play:     { on: (cb: () => void) => void }
    pause:    { on: (cb: () => void) => void }
    ended:    { on: (cb: () => void) => void }
    progress: { on: (cb: (pos: number, dur: number) => void) => void }
    error:    { on: (cb: (err: unknown) => void) => void }
  }
}
