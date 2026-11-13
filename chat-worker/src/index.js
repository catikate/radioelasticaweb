import { ALLOWED_ORIGINS } from './config.js'
import { authenticate } from './auth.js'

export { ChatRoom } from './chatroom.js'

function timingSafeEqual(a, b) {
  const enc = new TextEncoder()
  const x = enc.encode(a), y = enc.encode(b)
  if (x.length !== y.length) return false
  let diff = 0
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i]
  return diff === 0
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const room = env.CHAT_ROOM.get(env.CHAT_ROOM.idFromName('general'))

    // --- WebSocket del chat ---
    if (url.pathname === '/ws') {
      if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
        return new Response('Expected WebSocket', { status: 426 })
      }
      const origin = request.headers.get('Origin')
      if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
        return new Response('Origin not allowed', { status: 403 })
      }
      const user = await authenticate(request, env)
      if (!user) return new Response('Unauthorized', { status: 401 })

      // El Worker fija x-user; el cliente nunca puede inyectarlo.
      const headers = new Headers(request.headers)
      headers.set('x-user', JSON.stringify(user))
      return room.fetch(new Request(request, { headers }))
    }

    // --- Moderación: POST /admin/{delete|ban|unban} con Bearer ADMIN_TOKEN ---
    if (url.pathname.startsWith('/admin/') && request.method === 'POST') {
      const token = (request.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
      if (!env.ADMIN_TOKEN || !timingSafeEqual(token, env.ADMIN_TOKEN)) {
        return new Response('Forbidden', { status: 403 })
      }
      return room.fetch(request)
    }

    return new Response('Radio Elástica chat', { status: 200 })
  },
}
