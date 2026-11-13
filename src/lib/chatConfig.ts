// URL del WebSocket del chat (Cloudflare Worker en /chat-worker).
// Único sitio donde cambiarla. En `astro dev` apunta a `wrangler dev`.
export const CHAT_WS_URL = import.meta.env.DEV
  ? 'ws://localhost:8787/ws'
  : 'wss://radioelastica-chat.catalinaviscoitaliano.workers.dev/ws'
