# Guia de tags para subir episodios a Mixcloud

## Donde se ponen los tags

1. Entra a [mixcloud.com/upload](https://www.mixcloud.com/upload/) o edita un episodio existente
2. En el formulario de subida, busca el campo **"Tags"** (esta debajo del titulo y la descripcion)
3. Escribi el tag y presiona Enter para agregarlo
4. Podes agregar varios tags, uno por uno

## Que tags poner

Cada episodio lleva SIEMPRE dos tags principales + la temporada: el tag del
PROGRAMA (que show es) y el tag de RESIDENTE (quien lo hace). Siempre en
minusculas y con guiones.

### 1. El tag del programa (SIEMPRE)

Identifica el SHOW. Es lo que hace que el episodio aparezca en la pagina de ese
show. Ponelo en todos los episodios, sea el programa que sea:

| Programa | Tag |
|----------|-----|
| Sentimientos Encontrados | `programa-sentimientos-encontrados` |
| Sesiones Multipotenciales | `programa-sesiones-multipotenciales` |
| Los Fantasmas de Mi Vida | `programa-los-fantasmas-de-mi-vida` |
| Metalico Espejado | `programa-metalico-espejado` |
| Notas de Voz | `programa-notas-de-voz` |
| Peaje al Paraiso | `programa-peaje-al-paraiso` |
| Siento Esto | `programa-siento-esto` |
| Tante Buone Cose | `programa-tante-buone-cose` |
| Sintonia Variable | `programa-sintonia-variable` |
| Fantasias Graficas | `programa-fantasias-graficas` |
| Una Manana Elastica | `programa-manana-elastica` |
| Un Lugar Llamado | `programa-un-lugar-llamado` |

### 2. Tu tag de residente (SIEMPRE que seas residente)

Identifica a la PERSONA. Hace que el episodio aparezca en tu pagina de residente
— incluyendo cuando participas como invitada en el show de otrx.

| Residente | Tag |
|-----------|-----|
| Draga | `residente-draga` |
| Juli Kova | `residente-juli-kova` |
| Cati Kate | `residente-cati-kate` |
| Lafat Bordieu | `residente-lafat-bordieu` |
| 1919 | `residente-1919` |
| Isovel | `residente-isovel` |
| Valen Miau | `residente-valen-miau` |
| Petra y Ashasha | `residente-petra-y-ashasha` |
| Franco D' | `residente-franco-d` |

Los shows rotativos (Fantasias Graficas, Una Manana Elastica, Un Lugar Llamado)
los conduce gente distinta cada vez: van con el tag del programa y, si quien
conduce es residente, tambien su tag de residente + `guest`.

### 3. Temporada (siempre)

Agrega `temporada-1` a todos los episodios.

### 4. Invitadas (cuando aplica)

Si conduces o participas en un show que no es el tuyo, agrega `guest` (ademas de
tu tag de residente).

## Ejemplos

| Situacion | Tags |
|-----------|------|
| Draga sube un Sentimientos Encontrados | `programa-sentimientos-encontrados`, `residente-draga`, `temporada-1` |
| Cati Kate sube un Los Fantasmas de Mi Vida | `programa-los-fantasmas-de-mi-vida`, `residente-cati-kate`, `temporada-1` |
| Petra y Ashasha suben un Tante Buone Cose | `programa-tante-buone-cose`, `residente-petra-y-ashasha`, `temporada-1` |
| Lafat sube un Metalico Espejado | `programa-metalico-espejado`, `residente-lafat-bordieu`, `temporada-1` |
| Cati Kate invitada en Una Manana Elastica | `programa-manana-elastica`, `residente-cati-kate`, `guest`, `temporada-1` |
| Una invitada (no residente) conduce Un Lugar Llamado | `programa-un-lugar-llamado`, `guest`, `temporada-1` |

## Importante

- **No inventes tags nuevos** sin avisar — la web no los reconoce y el episodio no aparece donde deberia
- **No te olvides el tag de programa** — sin el, el episodio no aparece en la pagina del show
- **No te olvides el tag de residente** — sin el, el episodio no aparece en tu pagina de residente
- **La mayuscula/minuscula no importa** — Mixcloud lo normaliza, pero por consistencia escribilos en minuscula
- **Los episodios se cargan al construir la web (no en tiempo real).** Despues de subir o editar tags en Mixcloud, hay que **actualizar la web** (boton de deploy / `actualizar-web.html`) para que el episodio aparezca. Puede tardar unos minutos en terminar el build.
- **La web solo lee los ultimos 100 episodios** de la cuenta al construirse — episodios muy viejos podrian no aparecer.
