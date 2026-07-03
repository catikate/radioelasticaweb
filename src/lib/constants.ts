// ============================================================
// Radio Elástica — Constantes del proyecto
// ============================================================

// ------------------------------------------------------------
// Mixcloud
// ------------------------------------------------------------

export const MIXCLOUD_USER = import.meta.env.PUBLIC_MIXCLOUD_USER ?? 'radioelastica'
export const MIXCLOUD_BASE = 'https://api.mixcloud.com'
export const MIXCLOUD_WIDGET_SCRIPT = 'https://widget.mixcloud.com/media/js/widgetApi.js'

export const CACHE = {
  CLOUDCASTS: 600,
  PROFILE:    3600,
  STATIC:     86400,
} as const

// ------------------------------------------------------------
// Horario de emisión
// ------------------------------------------------------------

export const EMISSION = {
  DAY:        3,
  START_H:    11,
  START_M:    11,
  END_H:      13,
  END_M:      13,
  START_MINS: 11 * 60 + 11,
  END_MINS:   13 * 60 + 13,
} as const

// ------------------------------------------------------------
// Textos del reproductor por estado
// ------------------------------------------------------------

export const PLAYER_COPY = {
  live: {
    badge:    'EN VIVO',
    title:    'Radio Elástica',
    subtitle: 'Emitiendo ahora',
  },
  soon: {
    badge:    'HOY 11:11',
    title:    'Próxima emisión',
    subtitle: (countdown: string) => `En ${countdown}`,
  },
  offline: {
    badge:    'OFFLINE',
    title:    'Sin emisión ahora',
    subtitle: (date: string) => `Vuelve el ${date}`,
  },
} as const

// ------------------------------------------------------------
// Tags de Mixcloud — NOMENCLATURA OFICIAL DEFINITIVA
//
// CRÍTICO: no cambiar una vez que empecéis a subir episodios.
// Si cambiáis un tag, hay que re-etiquetar todos los episodios
// anteriores en Mixcloud manualmente.
//
// REGLA GENERAL — cada episodio lleva:
//   1. residente-{slug}       si tiene residente fija
//   2. programa-{slug}        si es formato rotativo O tiene dos programas
//   3. género musical         techno, ambient, pop, etc.
//   4. temporada-1            para filtrar por temporada en el futuro
// ------------------------------------------------------------

// Programas con residente fija
// El tag del residente es suficiente para identificar el programa
export const TAGS_RESIDENTES = {
  draga:          'residente-draga',
  juliKova:       'residente-juli-kova',
  catiKate:       'residente-cati-kate',
  lafatBordieu:   'residente-lafat-bordieu',  // solo para Metálico Espejado
  mil919:         'residente-1919',
  isovel:         'residente-isovel',
  valenMiau:      'residente-valen-miau',
  petraAshasha:   'residente-petra-y-ashasha',
  francoD:        'residente-franco-d',
} as const

// Programas de formato rotativo (el conductor puede cambiar)
// Se identifican por el programa, no por la persona
export const TAGS_PROGRAMAS = {
  fantasiasGraficas:  'programa-fantasias-graficas',  // conduce Lafat ahora, puede cambiar
  unaMananaElastica:  'programa-manana-elastica',      // anfitrión diferente cada episodio
  metalicoEspejado:   'programa-metalico-espejado',    // segundo tag para Lafat
  unLugarLlamado:     'programa-un-lugar-llamado',     // invitadx diferente cada episodio
} as const

// Tag para guests (no residentes fijas)
export const TAG_GUEST = 'guest'

// Temporada actual
export const TAG_TEMPORADA = 'temporada-1'

// ------------------------------------------------------------
// Diseño — identidad visual
// ------------------------------------------------------------

export const COLORS = {
  primary:      '#0E76FF   ',
  logoWhite:    '#FFFFFF',
  playerBg:     '#1a1a2e',
  playerBorder: '#3878F533',  // primary con opacidad
  inkBlue:      '#1B3FAB',
} as const

export const ASSETS = {
  logoTransparent: '/assets/logo-sin-fondo.png',
  logoSquare:      '/assets/logo-square.jpg',
  logoWide:        '/assets/logo-wide.jpg',
  navButtons: {
    programas:  '/assets/nav/programas.png',
    residentes: '/assets/nav/residentes.png',
    calendario: '/assets/nav/calendario.png',
    tienda:     '/assets/nav/tienda.png',
  },
} as const

// ------------------------------------------------------------
// Programas — Temporada 1
//
// tags: array de tags que identifican este programa en Mixcloud
//       Al subir un episodio, poned TODOS los tags de su programa.
// tipo: 'residente' = conductor fijo | 'rotativo' = cambia
// ------------------------------------------------------------

export const PROGRAMAS = [
  {
    slug:           'sentimientos-encontrados',
    titulo:         'Sentimientos Encontrados w/ Draga',
    programa:       'Sentimientos Encontrados',
    residente:      'Draga',
    tipo:           'residente' as const,
    tags:           [TAGS_RESIDENTES.draga, TAG_TEMPORADA],
    descripcion:    'El crossover entre literatura y música. Palabra hablada, análisis de lyrics, salseo. Entrevistas a artistas que han indagado este cruce. Poesía, joyas ocultas y temazos.',
    descripcionImg: '/assets/programas/desc/sentimientos-encontrados.png',
    foto:           '/assets/programas/sentimientos-encontrados.png',
    temporada:      1,
  },
  {
    slug:           'sesiones-multipotenciales',
    titulo:         'Sesiones Multipotenciales w/ Juli Kova',
    programa:       'Sesiones Multipotenciales',
    residente:      'Juli Kova',
    tipo:           'residente' as const,
    tags:           [TAGS_RESIDENTES.juliKova, TAG_TEMPORADA],
    descripcion:    'En tiempos de extremismos, celebremos el eclecticismo. Un espacio sonoro para viajar por líneas de bajo hipnóticas, girls to the front, post-punk, dub, indie, pop, géneros híbridos, oldies y rarezas.',
    descripcionImg: '/assets/programas/desc/sesiones-multipotenciales.png',
    foto:           '/assets/programas/sesiones-multipotenciales.png',
    temporada:      1,
  },
  {
    slug:           'los-fantasmas-de-mi-vida',
    titulo:         'Los Fantasmas de Mi Vida w/ Cati Kate',
    programa:       'Los Fantasmas de Mi Vida',
    residente:      'Cati Kate',
    tipo:           'residente' as const,
    tags:           [TAGS_RESIDENTES.catiKate, TAG_TEMPORADA],
    descripcion:    'Canciones que no suenan, aparecen. La música como duelo compartido y celebración extraña. El mapa de un presente que mira hacia atrás. Y ahí, entre los fantasmas, también se baila.',
    descripcionImg: '/assets/programas/desc/los-fantasmas-de-mi-vida.png',
    foto:           '/assets/programas/los-fantasmas-de-mi-vida.png',
    temporada:      1,
  },
  {
    slug:           'metalico-espejado',
    titulo:         'Metálico Espejado w/ Lafat Bordieu',
    programa:       'Metálico Espejado',
    residente:      'Lafat Bordieu',
    tipo:           'residente' as const,
    // Dos tags: residente + programa — para distinguirlo de Fantasías Gráficas
    tags:           [TAGS_RESIDENTES.lafatBordieu, TAGS_PROGRAMAS.metalicoEspejado, TAG_TEMPORADA],
    descripcion:    'Musicalizado solo con CDs. Un tributo al increíble talismán tornasol y al concepto de crear discos como una experiencia. Fragmentos de álbumes, historias, curiosidades y algún que otro chisme.',
    descripcionImg: '/assets/programas/desc/metalico-espejado.png',
    foto:           '/assets/programas/metalico-espejado.png',
    temporada:      1,
  },
  {
    slug:           'notas-de-voz',
    titulo:         'Notas de Voz w/ 1919',
    programa:       'Notas de Voz',
    residente:      '1919',
    tipo:           'residente' as const,
    tags:           [TAGS_RESIDENTES.mil919, TAG_TEMPORADA],
    descripcion:    'Un viaje poco lineal de notas de audio, shitposting narrado, canciones y sentimentalismo. De la imagen a la voz, contenido extraído de archivos de internet y lo que pasa a través de un móvil.',
    descripcionImg: '/assets/programas/desc/notas-de-voz.png',
    foto:           '/assets/programas/notas-de-voz.png',
    temporada:      1,
  },
  {
    slug:           'fantasias-graficas',
    titulo:         'Fantasías Gráficas',
    programa:       'Fantasías Gráficas',
    residente:      'Lafat Bordieu',   // conductora actual — puede cambiar
    tipo:           'rotativo' as const,
    // Solo tag del programa — así si cambia de conductora no hay que retocar
    tags:           [TAGS_PROGRAMAS.fantasiasGraficas, TAG_TEMPORADA],
    descripcion:    'Un colectivo de amigas que fomenta el arte gráfico, el fanzine, la ilustración y la autopublicación. Con enfoque migrante, queer y experimental. Entrevistas donde cada invitadx cuenta su trabajo y la música que les inspira.',
    descripcionImg: '/assets/programas/desc/fantasias-graficas.png',
    foto:           '/assets/programas/fantasias-graficas.png',
    temporada:      1,
  },
  {
    slug:        'una-manana-elastica',
    titulo:      'Una Mañana Elástica',
    programa:    'Una Mañana Elástica',
    residente:   'Varios',
    tipo:        'rotativo' as const,
    tags:        [TAGS_PROGRAMAS.unaMananaElastica, TAG_TEMPORADA],
    descripcion: 'Show libre donde cada episodio tiene unx anfitrión diferente que deleita con una hora de su selección musical para amenizar la mañana. Un espacio flexible para nuestras amigas.',
    foto:        '/assets/programas/una-manana-elastica.png',
    temporada:   1,
  },
  {
    slug:        'peaje-al-paraiso',
    titulo:      'Peaje al Paraíso w/ Isovel',
    programa:    'Peaje al Paraíso',
    residente:   'Isovel',
    tipo:        'residente' as const,
    tags:        [TAGS_RESIDENTES.isovel, TAG_TEMPORADA],
    descripcion: 'Estamos yendo, sí, ya casi llegamos. Ese lugar que nos fue prohibido tiene una puerta, yo lo sé. Soy otra pagando el precio de estar viva, cada vez más cerca de lo divino. Mezcla música con literatura, palabras que son rezos (paganos, claro).',
    foto:        '/assets/programas/peaje-al-paraiso.png',
    temporada:   1,
  },
  {
    slug:        'siento-esto',
    titulo:      'Siento Esto w/ Valen Miau',
    programa:    'Siento Esto',
    residente:   'Valen Miau',
    tipo:        'residente' as const,
    tags:        [TAGS_RESIDENTES.valenMiau, TAG_TEMPORADA],
    descripcion: 'Un recorrido por las entradas de diarios íntimos escritos durante los años de migración. De manera oracular y azarosa, se comparten algunos procesos de sensaciones vividas proponiendo a la escritura como catarsis. Entre vómitos viscerales, recuerdos y confesiones, la idea es expandir el relato junto a la música, conectándola con sus historias y sentimientos.',
    foto:        '/assets/programas/siento-esto.png',
    temporada:   1,
  },
  {
    slug:        'tante-buone-cose',
    titulo:      'Tante Buone Cose w/ Petra y Ashasha',
    programa:    'Tante Buone Cose',
    residente:   'Petra y Ashasha',
    tipo:        'residente' as const,
    tags:        [TAGS_RESIDENTES.petraAshasha, TAG_TEMPORADA],
    descripcion: 'Queremos escuchar música juntis, imaginarnos escenarios. Que pase el frío, que pase el calor. Que pasen los minutos, las horas, los programas en la radio. Queremos hablar de música para no hablar de gatitos. Hablar de música para hablar del fin del mundo. Compartir una hora con alguien que no vemos. Agradecerle a la tecnología y después arrepentirnos. Desear la espera y después arrepentirnos. Elegir canciones, que sean tantas y que sean buenas y que seamos felices.',
    foto:        '/assets/programas/tante-buone-cose.png',
    temporada:   1,
  },
  {
    slug:        'un-lugar-llamado',
    titulo:      'Un Lugar Llamado…',
    programa:    'Un Lugar Llamado…',
    residente:   'Varios',
    tipo:        'rotativo' as const,
    tags:        [TAGS_PROGRAMAS.unLugarLlamado, TAG_TEMPORADA],
    descripcion: 'En cada episodio, una persona invitada nos mostrará música de un lugar en específico, ya sea un país, un territorio, un paisaje o un espacio. Así, cada capítulo se transformará en un viaje sonoro por ese lugar, casi como un soundtrack ambiental de ese sitio.',
    foto:        '/assets/programas/un-lugar-llamado.png',
    temporada:   1,
  },
  {
    slug:        'sintonia-variable',
    titulo:      "Sintonía Variable w/ Franco D'",
    programa:    'Sintonía Variable',
    residente:   "Franco D'",
    tipo:        'residente' as const,
    tags:        [TAGS_RESIDENTES.francoD, TAG_TEMPORADA],
    descripcion: "Desde Buenos Aires (Argentina) Lacura crew lleva su imaginario a la radio. Sintonía Variable es un programa para construir y compartir mundos sonoros. Comandado por Franco D' con invitados especiales en un espacio abierto de emisiones eclécticas, afectivas y experimentales. Un viaje a través de los sonidos que más atesoramos ahí donde podemos perdernos y encontrarnos.",
    foto:        '/assets/programas/sintonia-variable.png',
    temporada:   1,
  },
] as const

// Helper — genera el título en formato canónico
export function tituloPrograma(programa: string, residente: string): string {
  return `${programa} w/ ${residente}`
}

// Helper — convierte un nombre a slug URL-safe
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // quitar acentos
    .replace(/[^a-z0-9\s-]/g, '')                       // quitar ap\u00f3strofes y otros no url-safe
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')                               // colapsar guiones repetidos
}

// ------------------------------------------------------------
// Layout
// ------------------------------------------------------------

export const LAYOUT = {
  navHeight:    96,
  playerHeight: 72,
} as const
