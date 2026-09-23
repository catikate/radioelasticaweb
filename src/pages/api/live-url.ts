import type { APIRoute } from 'astro'
import { MIXCLOUD_USER } from '@/lib/constants'
import { getCalendar, isNow } from '@/lib/calendar'

export const prerender = false

// www.mixcloud.com/live/<user>/ quedó bloqueada por el WAF de Cloudflare de Mixcloud
// (403 "Sorry, you have been blocked" para cualquier cliente no-navegador, incluida
// la función de Netlify). En su lugar usamos su API GraphQL (app.mixcloud.com/graphql),
// que no está protegida y expone isLive + hlsUrl directamente, sin scraping de HTML.
const GRAPHQL_ENDPOINT = 'https://app.mixcloud.com/graphql'
const LIVE_QUERY = `
  query($u: String!) {
    userLookup(lookup: { username: $u }) {
      isLive
      liveStream { hlsUrl }
    }
  }
`

export const GET: APIRoute = async () => {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ query: LIVE_QUERY, variables: { u: MIXCLOUD_USER } }),
    })
    if (!res.ok) return Response.json({ isLive: false })

    const json      = await res.json()
    const userLookup = json?.data?.userLookup
    const hlsUrl    = userLookup?.isLive ? userLookup?.liveStream?.hlsUrl : null
    if (!hlsUrl) return Response.json({ isLive: false })

    // El worker espera host+path sin esquema (ver ALLOWED en radioelastica-proxy).
    const proxyUrl = `https://radioelastica-proxy.catalinaviscoitaliano.workers.dev/${hlsUrl.replace(/^https:\/\//, '')}`

    const slots = await getCalendar().catch(() => [])
    const current = slots.find(s => isNow(s.fecha, s.inicio, s.fin))
    const currentShow = current
      ? { programa: current.programa, residente: current.residente }
      : null

    return Response.json({ isLive: true, proxyUrl, currentShow }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
    })
  } catch {
    return Response.json({ isLive: false }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
    })
  }
}
