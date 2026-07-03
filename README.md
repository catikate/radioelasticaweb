# Radio Elástica

[![Netlify Status](https://api.netlify.com/api/v1/badges/TU-BADGE-ID/deploy-status)](https://app.netlify.com/sites/radioelastica/deploys)

Website for [Radio Elástica](https://radioelastica.com) — independent online radio station from Barcelona. Live every Wednesday at 11:11.

**[radioelastica.com](https://radioelastica.com)**

---

## Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Astro 4 + React islands | Static HTML by default, JS only where needed |
| Styles | Tailwind CSS | Utility-first, no custom CSS |
| Global state | Nanostores | Minimal footprint, Astro-compatible |
| Audio | Mixcloud API + Widget | Programme CMS without a database |
| Calendar | Google Sheets (public CSV) | Editable by non-technical team members |
| Deploy | Netlify (hybrid SSR) | Automatic CI/CD from GitHub |

---

## Architecture decisions

**No database.** Mixcloud acts as the CMS for all audio content. Episodes are published there with specific tags and the site fetches them via API at build time. The calendar lives in a Google Sheet published as CSV. Zero server infrastructure.

**Islands Architecture.** Only two components require client-side JavaScript: the player (`PlayerBar`) and the live broadcast status (`OnAirStrip`). Everything else is static HTML, resulting in faster pages and better SEO.

**Minimal global state.** Only the player has global state (Nanostores). This keeps the codebase predictable — any component can know what is currently playing without prop drilling.

**No-code deploy for the team.** A standalone HTML file with a button calls the Netlify Deploy Hook via POST. Any team member can update the calendar and publish new episodes without access to GitHub or Netlify.

---

## Getting started

```bash
npm install
cp .env.example .env   # fill in Mixcloud username and Sheet URL
npm run dev            # local server at localhost:4321
npm run build          # production build
npm run preview        # preview the build
```

## Environment variables

```bash
# .env
PUBLIC_MIXCLOUD_USER=radioelastica
CALENDAR_SHEET_URL=https://docs.google.com/spreadsheets/d/.../export?format=csv
```

---

## Project structure

```
src/
  components/
    player/           # PlayerBar.tsx — fixed bottom player
    layout/           # Navbar
    home/             # Home page components
  layouts/
    Base.astro        # Base layout (navbar + player + Mixcloud iframe)
  lib/
    constants.ts      # Programmes, tags, schedule, copy
    mixcloud.ts       # Mixcloud API (episode fetching)
    calendar.ts       # Calendar from Google Sheet
    widget.ts         # Mixcloud widget control (play, pause, seek)
    store.ts          # Global state (nanostores)
    schedule.ts       # Live broadcast logic
    types.ts          # TypeScript types
  pages/
    index.astro       # Home
    programas/        # Programme list and detail
    residentes/       # Resident list and detail
    calendario/       # Schedule grid
    tienda/           # Coming soon
docs/
  guia-tags-mixcloud.md   # Tagging guide for residents
```

---

## Content management

### Programmes (Temporada 1)

| Programme | Host | Type |
|---|---|---|
| Sentimientos Encontrados | Draga | resident |
| Sesiones Multipotenciales | Juli Kova | resident |
| Los Fantasmas de Mi Vida | Cati Kate | resident |
| Metálico Espejado | Lafat Bordieu | resident |
| Notas de Voz | 1919 | resident |
| Fantasías Gráficas | Lafat Bordieu | rotating |
| Una Mañana Elástica | Various | rotating |
| Peaje al Paraíso | Isovel | resident |
| Siento Esto | Valen Miau | resident |
| Tante Buone Cose | Petra y Ashasha | resident |
| Un Lugar Llamado… | Various | rotating |
| Sintonía Variable | Franco D' | resident |

### Adding or editing a programme

Programmes are defined in `src/lib/constants.ts` in the `PROGRAMAS` array:

```ts
{
  slug:        'programme-slug',
  titulo:      'Programme Name w/ DJ Name',
  programa:    'Programme Name',
  residente:   'DJ Name',
  tipo:        'residente',        // 'residente' or 'rotativo'
  tags:        [TAGS_RESIDENTES.xxx, TAGS_PROGRAMAS.xxx, TAG_TEMPORADA],  // rotativo: [TAGS_PROGRAMAS.xxx, TAG_TEMPORADA]
  descripcion: 'Programme description.',
  foto:        '/assets/programas/slug.jpg',
  temporada:   1,
}
```

### Mixcloud tagging system

Every episode requires the following tags to appear on the site:

| Tag | When to use |
|---|---|
| `programa-{slug}` | **Always** — identifies the show. Each show's page filters by this tag, so it shows only that show's episodes. |
| `residente-{slug}` | When a fixed resident hosts (or guests on another show). Powers the resident's page, including their "Otras participaciones". |
| `temporada-1` | Always |
| `guest` | When hosting/guesting on a show that isn't your own |

**Why two tags:** the `programa-` tag routes an episode to its show page; the `residente-` tag routes it to the resident's page. A resident guesting on another show tags both, so the episode appears on that show's page *and* under the resident's "Otras participaciones".

Resident tags:

| Resident | Tag |
|---|---|
| Draga | `residente-draga` |
| Juli Kova | `residente-juli-kova` |
| Cati Kate | `residente-cati-kate` |
| Lafat Bordieu | `residente-lafat-bordieu` |
| 1919 | `residente-1919` |
| Isovel | `residente-isovel` |
| Valen Miau | `residente-valen-miau` |
| Petra y Ashasha | `residente-petra-y-ashasha` |
| Franco D' | `residente-franco-d` |

Programme tags (one per show, always required):

| Programme | Tag |
|---|---|
| Sentimientos Encontrados | `programa-sentimientos-encontrados` |
| Sesiones Multipotenciales | `programa-sesiones-multipotenciales` |
| Los Fantasmas de Mi Vida | `programa-los-fantasmas-de-mi-vida` |
| Metálico Espejado | `programa-metalico-espejado` |
| Notas de Voz | `programa-notas-de-voz` |
| Peaje al Paraíso | `programa-peaje-al-paraiso` |
| Siento Esto | `programa-siento-esto` |
| Tante Buone Cose | `programa-tante-buone-cose` |
| Sintonía Variable | `programa-sintonia-variable` |
| Fantasías Gráficas | `programa-fantasias-graficas` |
| Una Mañana Elástica | `programa-manana-elastica` |
| Un Lugar Llamado… | `programa-un-lugar-llamado` |

### Updating the calendar

The calendar is powered by a Google Sheet published as CSV, configured via `CALENDAR_SHEET_URL`.

Spreadsheet format:

| fecha | inicio | fin | programa | residente | tag_mixcloud | notas |
|---|---|---|---|---|---|---|
| 2026-04-22 | 11:11 | 12:12 | Los Fantasmas de Mi Vida | Cati Kate | residente-cati-kate | |

- `fecha`: format `YYYY-MM-DD`
- `inicio` / `fin`: format `HH:MM` (24h)

---

## Technical notes

- **Tag filtering:** The Mixcloud API ignores the `tags` parameter on the cloudcasts endpoint. Filtering is done client-side by comparing against each episode's tag array (case-insensitive).
- **Cache:** Episodes 10 min, user profiles 1 hour, calendar 1 hour.
- **Player:** The Mixcloud widget runs in a hidden iframe in `Base.astro`. `PlayerBar.tsx` controls the UI and communicates via the widget API.
- **Live detection:** Detected by day and time (Wednesday 11:11–13:13) defined in `constants.ts > EMISSION`. Recalculated every 30 seconds without API calls.

---

## License

Private project. All rights reserved.
