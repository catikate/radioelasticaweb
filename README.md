# Radio Elastica

Sitio web de Radio Elastica — emisora online independiente desde Barcelona.

**Stack:** Astro 4 + React + Tailwind CSS + Nanostores  
**Deploy:** Netlify (hybrid SSR)  
**Audio:** Mixcloud (API + widget embebido)  
**Calendario:** Google Sheets (CSV publico)

## Inicio rapido

```bash
npm install
npm run dev       # servidor local en localhost:4321
npm run build     # build de produccion
npm run preview   # preview del build
```

### Variables de entorno

Crear un archivo `.env` en la raiz:

```env
PUBLIC_MIXCLOUD_USER=radioelastica
CALENDAR_SHEET_URL=https://docs.google.com/spreadsheets/d/.../export?format=csv
```

## Estructura del proyecto

```
src/
  components/         # Componentes React y Astro
    player/           # Reproductor (PlayerBar.tsx)
    layout/           # Navbar
    home/             # Componentes del home
  layouts/
    Base.astro        # Layout base (navbar + player + iframe Mixcloud)
  lib/
    constants.ts      # Programas, tags, horarios, textos
    mixcloud.ts       # API de Mixcloud (fetch de episodios)
    calendar.ts       # Calendario desde Google Sheet
    widget.ts         # Control del widget Mixcloud (play, pause, seek)
    store.ts          # Estado global (nanostores)
    schedule.ts       # Logica de emision en vivo
    types.ts          # Tipos TypeScript
  pages/
    index.astro       # Home
    programas/        # Listado y detalle de programas
    residentes/       # Listado y detalle de residentes
    calendario/       # Grilla de programacion
    tienda/           # Proximamente
docs/
  guia-tags-mixcloud.md   # Guia para residentes
```

## Como actualizar contenido

### Agregar o editar un programa

Los programas se definen en `src/lib/constants.ts` en el array `PROGRAMAS`. Cada programa tiene:

```ts
{
  slug:        'nombre-del-programa',        // URL: /programas/nombre-del-programa
  titulo:      'Nombre del Programa w/ DJ',  // titulo completo
  programa:    'Nombre del Programa',        // nombre corto
  residente:   'Nombre',                     // conductor/a ('Varios' si es rotativo)
  tipo:        'residente',                  // 'residente' o 'rotativo'
  tags:        [TAGS_RESIDENTES.xxx, TAG_TEMPORADA],  // tags de Mixcloud
  descripcion: 'Descripcion del programa.',
  foto:        '/assets/programas/slug.jpg', // foto 3:4
  temporada:   1,
}
```

**Para agregar un programa nuevo:**

1. Agregar la foto en `public/assets/programas/` (formato vertical 3:4)
2. Si es un residente nuevo, agregar su tag en `TAGS_RESIDENTES` y su foto en `public/assets/residentes/`
3. Si es un programa rotativo o segundo programa de un residente, agregar su tag en `TAGS_PROGRAMAS`
4. Agregar la entrada en el array `PROGRAMAS`
5. Hacer build y deploy

### Subir episodios a Mixcloud (tags)

Al subir un episodio en [mixcloud.com/upload](https://www.mixcloud.com/upload/), es fundamental poner los tags correctos para que aparezca en la seccion correspondiente del sitio.

**Cada episodio lleva entre 2 y 3 tags:**

1. **Tag de residente** (siempre): identifica a la persona

   | Residente | Tag |
   |-----------|-----|
   | Draga | `residente-draga` |
   | Juli Kova | `residente-juli-kova` |
   | Cati Kate | `residente-cati-kate` |
   | Lafat Bordieu | `residente-lafat-bordieu` |
   | 1919 | `residente-1919` |

2. **Tag de programa** (solo si aplica): necesario para programas rotativos o residentes con mas de un programa

   | Programa | Tag |
   |----------|-----|
   | Metalico Espejado | `programa-metalico-espejado` |
   | Fantasias Graficas | `programa-fantasias-graficas` |
   | Una Manana Elastica | `programa-manana-elastica` |

3. **`temporada-1`** (siempre)

4. **`guest`** si es una invitada no residente

**Ejemplos:**

| Situacion | Tags |
|-----------|------|
| Draga sube Sentimientos Encontrados | `residente-draga`, `temporada-1` |
| Lafat sube Metalico Espejado | `residente-lafat-bordieu`, `programa-metalico-espejado`, `temporada-1` |
| Lafat conduce Una Manana Elastica | `residente-lafat-bordieu`, `programa-manana-elastica`, `temporada-1` |
| Invitada conduce Una Manana Elastica | `programa-manana-elastica`, `guest`, `temporada-1` |

> La guia completa para residentes esta en `docs/guia-tags-mixcloud.md`.

**Importante:** no inventar tags nuevos sin agregarlos primero en `constants.ts` — la web filtra episodios por estos tags y los que no coincidan no aparecen.

### Actualizar el calendario

El calendario se alimenta de un Google Sheet publicado como CSV. La URL se configura en la variable de entorno `CALENDAR_SHEET_URL`.

**Formato del spreadsheet** (columnas en orden):

| Fecha | Inicio | Fin | Programa | Residente | Tag Mixcloud | Notas |
|-------|--------|-----|----------|-----------|-------------|-------|
| 2026-04-22 | 11:11 | 12:12 | Los Fantasmas de Mi Vida | Cati Kate | residente-cati-kate | Episodio piloto |

- **Fecha:** formato `YYYY-MM-DD`
- **Inicio/Fin:** formato `HH:MM` (24h)
- **Programa:** nombre exacto del programa
- **Residente:** nombre del conductor/a
- **Tag Mixcloud:** el tag principal del programa
- **Notas:** opcional, texto libre

Para actualizar la programacion simplemente editar el Google Sheet. Los cambios se reflejan en la web automaticamente (cache de 1 hora).

### Agregar un residente

1. Agregar la foto en `public/assets/residentes/{slug}.jpg` (formato vertical 3:4)
2. Agregar el tag en `TAGS_RESIDENTES` en `src/lib/constants.ts`
3. Agregar su programa en el array `PROGRAMAS`
4. Comunicarle los tags que debe usar al subir episodios (ver `docs/guia-tags-mixcloud.md`)

## Notas tecnicas

- **Filtrado de tags:** la API de Mixcloud ignora el parametro `tags` en el endpoint de cloudcasts. El filtrado se hace client-side comparando contra el array `tags` de cada episodio (case-insensitive).
- **Cache:** episodios 10 min, perfil 1 hora, calendario 1 hora.
- **Reproductor:** el widget de Mixcloud corre en un iframe oculto en `Base.astro`. El componente `PlayerBar.tsx` controla la UI y se comunica via la API del widget.
- **Emision en vivo:** se detecta por dia y hora (miercoles 11:11–13:13) definidos en `constants.ts > EMISSION`.
