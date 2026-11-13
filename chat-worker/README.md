# Radio Elástica — chat comunitario

Cloudflare Worker + un Durable Object (SQLite, plan gratuito) con una sala única
`general`. WebSocket Hibernation API. Sin dependencias en runtime.

```
src/index.js     Worker: ruta /ws, comprobación de Origin, /admin/*
src/auth.js      authenticate(request) — hoy devuelve un invitado anónimo
src/chatroom.js  Durable Object: mensajes, historial, rate limit, moderación
src/config.js    Orígenes permitidos, límites, lista de palabras prohibidas
src/text.js      Limpieza de HTML y filtro de palabras
```

Frontend: `src/components/chat/Chat.astro` (en la web) y la URL del WebSocket en
`src/lib/chatConfig.ts` (`CHAT_WS_URL`, único sitio).

## Protocolo

Cliente → servidor: `{type:"join", nick}` y `{type:"message", text}`.
Servidor → cliente: `{type:"history", messages:[…]}` (últimos 50 al unirse),
`{type:"message", id, nick, text, ts}`, `{type:"delete", id}`, `{type:"error", text}`.
Un `"ping"` de texto recibe `"pong"` sin despertar al objeto.

## Local

```bash
cd chat-worker
npm install                 # solo wrangler (devDependency)
echo 'ADMIN_TOKEN=dev' > .dev.vars
npx wrangler dev            # → ws://localhost:8787/ws
# en otra terminal, en la raíz del repo:
npm run dev                 # astro dev (4321); en dev usa ws://localhost:8787/ws
```

## Desplegar

```bash
cd chat-worker
npx wrangler login
npx wrangler deploy
npx wrangler secret put ADMIN_TOKEN      # pega un token largo y aleatorio
```

Sale en `https://radioelastica-chat.<tu-subdominio>.workers.dev`. Pon esa URL
(`wss://…/ws`) en `src/lib/chatConfig.ts`, o usa un dominio propio:

1. En `wrangler.toml` descomenta `routes = [{ pattern = "chat.radioelastica.com", custom_domain = true }]`
   (la zona `radioelastica.com` debe estar en Cloudflare; crea el DNS solo).
2. `npx wrangler deploy` de nuevo.
3. Comprueba que `src/lib/chatConfig.ts` apunta a `wss://chat.radioelastica.com/ws`.

Antes de desplegar, revisa `ALLOWED_ORIGINS` en `src/config.js` (sobre todo el
dominio `*.netlify.app` real) — conexiones desde otros orígenes reciben 403.

## Moderación

```bash
H='Authorization: Bearer TU_ADMIN_TOKEN'; W=https://chat.radioelastica.com
curl -X POST $W/admin/delete -H "$H" -d '{"id":123}'        # borra un mensaje (id visible en el JSON del WS)
curl -X POST $W/admin/ban    -H "$H" -d '{"nick":"fulano"}' # bloquea el apodo y expulsa sus conexiones
curl -X POST $W/admin/unban  -H "$H" -d '{"nick":"fulano"}'
```

El baneo es por apodo (sin distinguir mayúsculas/tildes) y se guarda hasta que
lo levantes con `unban`. Un invitado puede cambiar de apodo, así que es una
medida básica; el baneo fuerte llegará con login real (ver `src/auth.js`).

## Plan gratuito: límites y qué vigilar

Cifras de la documentación de Cloudflare a la fecha de escribir esto; confírmalas
en *Workers & Pages → Plans*.

- **Las peticiones de Workers son por cuenta, no por Worker** (100.000/día en
  gratis). `radioelastica-proxy` ya llegó a ese tope: si el chat consume cuota,
  **puede tumbar el reproductor en directo**. Cada apertura/reconexión del chat
  es 1 petición. Por eso el widget solo conecta cuando alguien abre el chat y
  reconecta con backoff.
- **Durable Objects (gratis):** ~100.000 peticiones/día; los mensajes entrantes
  de un WebSocket cuentan a razón de 20:1 (los salientes no cuentan). Hay
  límite de duración (GB-s/día), pero con Hibernation el objeto duerme entre
  mensajes y no factura mientras duerme.
- **Almacenamiento SQLite:** límites diarios de filas leídas/escritas. Cada
  mensaje escribe ~3 filas; cada *join* lee 50 (el historial). Mucho margen, pero
  mucha gente entrando/saliendo lee más que mucha gente escribiendo.
- **Una sola sala = un solo objeto.** Un DO procesa unos pocos cientos de
  peticiones/s y mantiene todos los sockets; para cientos de oyentes
  simultáneos va bien, para miles habría que repartir en varias salas.
- **Qué mirar:** dashboard → *Workers & Pages → radioelastica-chat → Metrics*
  (peticiones, errores) y *Durable Objects* (duración, filas). Si te acercas al
  tope: sube `RATE_*` en `config.js`, haz que el widget cierre el socket tras
  inactividad, o pasa al plan de pago de Workers (5 USD/mes).
