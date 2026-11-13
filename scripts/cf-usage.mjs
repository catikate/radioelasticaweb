#!/usr/bin/env node
// Uso de Cloudflare Workers (plan Free: 100.000 peticiones/día por cuenta).
// Compartido entre radioelastica-proxy (directo) y radioelastica-chat.
//
//   npm run cf:usage                 → últimos 7 días, por día y worker
//   npm run cf:usage -- --days 30    → otra ventana
//   npm run cf:usage -- --hourly     → últimas 24 h hora a hora (para tras un directo)
//
// Auth: usa CLOUDFLARE_API_TOKEN si existe; si no, el login de `wrangler`
// (~/.config/.wrangler/config/default.toml). Si ha caducado, lo refresca con
// `wrangler whoami` y reintenta. Solo lee analíticas; no modifica nada.
// Opcional: CF_ACCOUNT_ID para no consultarlo.

import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { spawnSync } from 'node:child_process'

const FREE_REQ_LIMIT = 100_000   // Workers: peticiones/día
const FREE_DO_GBS_LIMIT = 13_000 // Durable Objects: GB-s/día
const DO_MEM_GB = 0.128          // DO se factura como 128 MB (estimación)

const args = process.argv.slice(2)
const hourly = args.includes('--hourly')
const di = args.indexOf('--days')
const days = di >= 0 ? Math.max(1, Math.min(90, Number(args[di + 1]) || 7)) : 7

function readWranglerToken() {
  for (const p of [`${homedir()}/.config/.wrangler/config/default.toml`, `${homedir()}/.wrangler/config/default.toml`]) {
    try {
      const m = readFileSync(p, 'utf8').match(/^oauth_token\s*=\s*"(.*)"/m)
      if (m) return m[1]
    } catch {}
  }
  return null
}

let token = process.env.CLOUDFLARE_API_TOKEN || readWranglerToken()
if (!token) {
  console.error('No hay token. Haz `npx wrangler login` o define CLOUDFLARE_API_TOKEN.')
  process.exit(1)
}

async function cf(path, body) {
  const doFetch = () =>
    fetch(`https://api.cloudflare.com/client/v4${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
  let res = await doFetch()
  // Token OAuth de wrangler caducado → `wrangler whoami` lo refresca.
  if ((res.status === 401 || res.status === 403) && !process.env.CLOUDFLARE_API_TOKEN) {
    spawnSync('npx', ['--yes', 'wrangler', 'whoami'], { stdio: 'ignore' })
    token = readWranglerToken() || token
    res = await doFetch()
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`HTTP ${res.status} ${path}: ${JSON.stringify(json.errors ?? json).slice(0, 300)}`)
  return json
}

async function gql(query, variables) {
  const json = await cf('/graphql', { query, variables })
  if (json.errors?.length) throw new Error(`GraphQL: ${json.errors.map(e => e.message).join('; ')}`)
  return json.data.viewer.accounts[0]
}

const pct = (n, limit) => `${((n / limit) * 100).toFixed(n / limit < 0.01 ? 2 : 1)}%`
const bar = (n, limit) => {
  const f = Math.min(20, Math.round((n / limit) * 20))
  return '█'.repeat(f) + '░'.repeat(20 - f)
}
const flag = share => (share >= 0.8 ? '  🔴 CERCA DEL LÍMITE' : share >= 0.5 ? '  🟠 más de la mitad' : '')
const fmt = n => n.toLocaleString('es-ES')

const accountId = process.env.CF_ACCOUNT_ID || (await cf('/accounts')).result?.[0]?.id
if (!accountId) { console.error('No se pudo obtener el account id.'); process.exit(1) }

const now = new Date()
const since = new Date(now.getTime() - (hourly ? 24 * 3600e3 : days * 24 * 3600e3))
const sinceDate = since.toISOString().slice(0, 10)
const sinceTime = since.toISOString()

if (hourly) {
  const acc = await gql(
    `query($a:String!,$t:Time!){viewer{accounts(filter:{accountTag:$a}){
      workersInvocationsAdaptive(limit:2000,filter:{datetime_geq:$t}){
        dimensions{datetimeHour scriptName} sum{requests errors}}}}}`,
    { a: accountId, t: sinceTime },
  )
  const rows = acc.workersInvocationsAdaptive
  const hours = new Map()
  for (const r of rows) {
    const h = r.dimensions.datetimeHour
    const x = hours.get(h) ?? { total: 0, by: {} }
    x.total += r.sum.requests
    x.by[r.dimensions.scriptName] = (x.by[r.dimensions.scriptName] ?? 0) + r.sum.requests
    hours.set(h, x)
  }
  console.log(`\nPeticiones por hora, últimas 24 h (UTC)  — límite diario ${fmt(FREE_REQ_LIMIT)}\n`)
  let total = 0, peak = { h: '-', n: 0 }
  for (const h of [...hours.keys()].sort()) {
    const { total: n, by } = hours.get(h)
    total += n
    if (n > peak.n) peak = { h, n }
    const detail = Object.entries(by).map(([w, v]) => `${w.replace('radioelastica-', '')}:${fmt(v)}`).join('  ')
    console.log(`${h.slice(5, 16).replace('T', ' ')}  ${fmt(n).padStart(8)}  ${detail}`)
  }
  console.log(`\nTotal 24 h: ${fmt(total)} (${pct(total, FREE_REQ_LIMIT)} del límite diario)  · hora pico: ${peak.h.slice(11, 16)} UTC con ${fmt(peak.n)}`)
  console.log(`Ritmo de la hora pico mantenido 24 h sería ${fmt(peak.n * 24)} → ${pct(peak.n * 24, FREE_REQ_LIMIT)} del límite\n`)
  process.exit(0)
}

const acc = await gql(
  `query($a:String!,$d:Date!){viewer{accounts(filter:{accountTag:$a}){
    w: workersInvocationsAdaptive(limit:5000,filter:{date_geq:$d}){
      dimensions{date scriptName} sum{requests errors}}
    d: durableObjectsInvocationsAdaptiveGroups(limit:1000,filter:{date_geq:$d}){
      dimensions{date} sum{requests wallTime}}}}}`,
  { a: accountId, d: sinceDate },
)

const perDay = new Map()
for (const r of acc.w) {
  const d = r.dimensions.date
  const x = perDay.get(d) ?? { total: 0, errors: 0, by: {} }
  x.total += r.sum.requests
  x.errors += r.sum.errors
  x.by[r.dimensions.scriptName] = (x.by[r.dimensions.scriptName] ?? 0) + r.sum.requests
  perDay.set(d, x)
}
const doDay = new Map()
for (const r of acc.d) {
  const x = doDay.get(r.dimensions.date) ?? { req: 0, wall: 0 }
  x.req += r.sum.requests
  x.wall += r.sum.wallTime // µs
  doDay.set(r.dimensions.date, x)
}

console.log(`\nCloudflare Workers — últimos ${days} días (UTC; el contador se reinicia a las 00:00 UTC = 01:00/02:00 España)\n`)
console.log(`${'día'.padEnd(11)}${'peticiones'.padStart(11)}  ${'% de 100k'.padEnd(8)}  ${'uso'.padEnd(20)}  errores  detalle`)
let worst = { d: '-', n: 0 }
const allDays = [...new Set([...perDay.keys(), ...doDay.keys()])].sort()
for (const d of allDays) {
  const x = perDay.get(d) ?? { total: 0, errors: 0, by: {} }
  if (x.total > worst.n) worst = { d, n: x.total }
  const detail = Object.entries(x.by).map(([w, v]) => `${w.replace('radioelastica-', '')}:${fmt(v)}`).join('  ')
  console.log(
    `${d.padEnd(11)}${fmt(x.total).padStart(11)}  ${pct(x.total, FREE_REQ_LIMIT).padEnd(8)}  ${bar(x.total, FREE_REQ_LIMIT)}  ${String(x.errors).padStart(7)}  ${detail}${flag(x.total / FREE_REQ_LIMIT)}`,
  )
}
if (!allDays.length) console.log('(sin datos en esta ventana)')
console.log(`\nDía más cargado: ${worst.d} con ${fmt(worst.n)} peticiones (${pct(worst.n, FREE_REQ_LIMIT)} del límite)`)

if (doDay.size) {
  console.log('\nDurable Object del chat (límites Free: 100.000 peticiones/día y 13.000 GB-s/día)')
  for (const d of [...doDay.keys()].sort()) {
    const { req, wall } = doDay.get(d)
    const secs = wall / 1e6
    const gbs = secs * DO_MEM_GB
    console.log(`${d.padEnd(11)}${fmt(req).padStart(8)} peticiones (${pct(req, FREE_REQ_LIMIT)})   ${(secs / 60).toFixed(1).padStart(7)} min de reloj ≈ ${gbs.toFixed(0)} GB-s (${pct(gbs, FREE_DO_GBS_LIMIT)}, estimado)`)
  }
}
console.log('\nConsejo: tras un directo con público, `npm run cf:usage -- --hourly` muestra la hora pico.\n')
