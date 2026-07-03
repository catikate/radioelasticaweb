# Guia de tags para subir episodios a Mixcloud

## Donde se ponen los tags

1. Entra a [mixcloud.com/upload](https://www.mixcloud.com/upload/) o edita un episodio existente
2. En el formulario de subida, busca el campo **"Tags"** (esta debajo del titulo y la descripcion)
3. Escribi el tag y presiona Enter para agregarlo
4. Podes agregar varios tags, uno por uno

## Que tags poner

Cada episodio necesita entre 2 y 3 tags. Siempre en minusculas y con guiones.

### 1. Tu tag de residente (siempre)

Ponelo en TODOS tus episodios, sin importar el programa:

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

### 2. El tag del programa (solo si aplica)

Si participas en un programa rotativo o tenes mas de un programa, agrega tambien el tag del programa:

| Programa | Tag |
|----------|-----|
| Metalico Espejado | `programa-metalico-espejado` |
| Fantasias Graficas | `programa-fantasias-graficas` |
| Una Manana Elastica | `programa-manana-elastica` |
| Un Lugar Llamado | `programa-un-lugar-llamado` |

Los programas con residente unica (Sentimientos Encontrados, Sesiones Multipotenciales, Los Fantasmas de Mi Vida, Notas de Voz, Peaje al Paraiso, Siento Esto, Tante Buone Cose, Sintonia Variable) NO necesitan tag de programa — el tag de residente es suficiente.

### 3. Temporada (siempre)

Agrega `temporada-1` a todos los episodios.

### 4. Invitadas (cuando aplica)

Si es una invitada (no residente), agrega `guest`.

## Ejemplos

| Situacion | Tags |
|-----------|------|
| Draga sube un Sentimientos Encontrados | `residente-draga`, `temporada-1` |
| Juli Kova sube un Sesiones Multipotenciales | `residente-juli-kova`, `temporada-1` |
| Lafat sube un Metalico Espejado | `residente-lafat-bordieu`, `programa-metalico-espejado`, `temporada-1` |
| Lafat conduce Una Manana Elastica | `residente-lafat-bordieu`, `programa-manana-elastica`, `temporada-1` |
| Lafat sube un Fantasias Graficas | `programa-fantasias-graficas`, `temporada-1` |
| Una invitada conduce Una Manana Elastica | `programa-manana-elastica`, `guest`, `temporada-1` |
| Una invitada conduce Un Lugar Llamado | `programa-un-lugar-llamado`, `guest`, `temporada-1` |

## Importante

- **No inventes tags nuevos** sin avisar — la web no los reconoce y el episodio no aparece donde deberia
- **No te olvides el tag de residente** — sin el, el episodio no aparece en tu pagina de residente
- **La mayuscula/minuscula no importa** — Mixcloud lo normaliza, pero por consistencia escribilos en minuscula
- **Los episodios se cargan al construir la web (no en tiempo real).** Despues de subir o editar tags en Mixcloud, hay que **actualizar la web** (boton de deploy / `actualizar-web.html`) para que el episodio aparezca. Puede tardar unos minutos en terminar el build.
- **La web solo lee los ultimos 100 episodios** de la cuenta al construirse — episodios muy viejos podrian no aparecer.
