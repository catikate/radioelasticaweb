import { DurableObject } from 'cloudflare:workers'
import {
  NICK_MIN, NICK_MAX, TEXT_MAX, HISTORY_SIZE,
  RATE_MIN_GAP_MS, RATE_WINDOW_MS, RATE_MAX_IN_WINDOW,
} from './config.js'
import { clean, hasBadWord, nickKey } from './text.js'

const msgKey = (id) => 'm:' + String(id).padStart(10, '0')

// Sala única ("general"). Usa la API de hibernación: el objeto se duerme entre
// mensajes, y el estado por conexión vive en serializeAttachment (no en memoria).
export class ChatRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env)
    // Ping/pong sin despertar al objeto (mantiene viva la conexión gratis).
    this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'))
    this.ctx.blockConcurrencyWhile(async () => {
      this.seq = (await this.ctx.storage.get('seq')) ?? 0
      this.bans = new Set((await this.ctx.storage.get('bans')) ?? [])
    })
  }

  async fetch(request) {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/admin/')) return this.admin(url.pathname, request)

    const user = JSON.parse(request.headers.get('x-user') ?? '{}')
    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)
    this.ctx.acceptWebSocket(server)
    server.serializeAttachment({ uid: user.id, authNick: user.nick ?? null, nick: null, t: [] })
    return new Response(null, { status: 101, webSocket: client })
  }

  // ---------- mensajes de clientes ----------
  async webSocketMessage(ws, raw) {
    if (typeof raw !== 'string' || raw.length > 2000) return
    let data
    try { data = JSON.parse(raw) } catch { return }
    const att = ws.deserializeAttachment() ?? {}

    if (data.type === 'join') return this.join(ws, att, data)
    if (data.type === 'message') return this.message(ws, att, data)
  }

  async join(ws, att, data) {
    const nick = att.authNick ?? clean(data.nick)
    if (nick.length < NICK_MIN || nick.length > NICK_MAX) {
      return this.err(ws, `El apodo debe tener entre ${NICK_MIN} y ${NICK_MAX} caracteres.`)
    }
    if (hasBadWord(nick)) return this.err(ws, 'Apodo no permitido.')
    if (this.bans.has(nickKey(nick))) {
      ws.send(JSON.stringify({ type: 'error', text: 'Estás bloqueado del chat.' }))
      return ws.close(4003, 'banned')
    }
    ws.serializeAttachment({ ...att, nick })

    const rows = await this.ctx.storage.list({ prefix: 'm:', reverse: true, limit: HISTORY_SIZE })
    const messages = [...rows.values()].reverse()
    ws.send(JSON.stringify({ type: 'history', messages }))
  }

  async message(ws, att, data) {
    if (!att.nick) return this.err(ws, 'Primero indica tu apodo.')
    if (this.bans.has(nickKey(att.nick))) return ws.close(4003, 'banned')

    // Límite de ritmo por conexión
    const now = Date.now()
    const t = (att.t ?? []).filter((x) => now - x < RATE_WINDOW_MS)
    if ((t.length && now - t[t.length - 1] < RATE_MIN_GAP_MS) || t.length >= RATE_MAX_IN_WINDOW) {
      return this.err(ws, 'Vas muy rápido. Espera un momento.')
    }
    t.push(now)
    ws.serializeAttachment({ ...att, t })

    const text = clean(data.text)
    if (!text) return
    if (text.length > TEXT_MAX) return this.err(ws, `Máximo ${TEXT_MAX} caracteres.`)
    if (hasBadWord(text)) return this.err(ws, 'Mensaje no permitido.')

    const msg = { type: 'message', id: ++this.seq, nick: att.nick, text, ts: now }
    // Persistir y recortar a los últimos HISTORY_SIZE
    await this.ctx.storage.put({ seq: this.seq, [msgKey(msg.id)]: msg })
    if (msg.id > HISTORY_SIZE) await this.ctx.storage.delete(msgKey(msg.id - HISTORY_SIZE))
    this.broadcast(msg)
  }

  // ---------- moderación ----------
  async admin(path, request) {
    let body = {}
    try { body = await request.json() } catch {}

    if (path === '/admin/delete') {
      const id = Number(body.id)
      if (!Number.isInteger(id)) return new Response('id required', { status: 400 })
      await this.ctx.storage.delete(msgKey(id))
      this.broadcast({ type: 'delete', id })
      return Response.json({ ok: true })
    }

    if (path === '/admin/ban' || path === '/admin/unban') {
      const key = nickKey(clean(body.nick))
      if (!key) return new Response('nick required', { status: 400 })
      if (path === '/admin/ban') this.bans.add(key)
      else this.bans.delete(key)
      await this.ctx.storage.put('bans', [...this.bans])
      if (path === '/admin/ban') {
        for (const ws of this.ctx.getWebSockets()) {
          if (nickKey(ws.deserializeAttachment()?.nick ?? '') === key) ws.close(4003, 'banned')
        }
      }
      return Response.json({ ok: true })
    }
    return new Response('Not found', { status: 404 })
  }

  // ---------- utilidades ----------
  broadcast(obj) {
    const s = JSON.stringify(obj)
    for (const ws of this.ctx.getWebSockets()) {
      try { ws.send(s) } catch {}
    }
  }

  err(ws, text) {
    ws.send(JSON.stringify({ type: 'error', text }))
  }

  webSocketClose(ws, code, reason) { try { ws.close(code, reason) } catch {} }
  webSocketError(ws) { try { ws.close(1011, 'error') } catch {} }
}
