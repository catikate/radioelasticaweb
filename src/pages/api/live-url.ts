import type { APIRoute } from 'astro'
import { MIXCLOUD_USER } from '@/lib/constants'

export const prerender = false

const LIVE_PAGE  = `https://www.mixcloud.com/live/${MIXCLOUD_USER}/`
const CDN_PATTERN = /https:\/\/(live-[a-z0-9-]+\.mixcloud\.com\/hls\/[^\s"\\]+master\.m3u8)/

export const GET: APIRoute = async () => {
  try {
    const res = await fetch(LIVE_PAGE, {
      headers: {
        'User-Agent':      'curl/7.68.0',
        'Accept':          '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    if (!res.ok) return Response.json({ isLive: false })

    const html  = await res.text()
    const match = html.match(CDN_PATTERN)
    if (!match)  return Response.json({ isLive: false })

    const proxyUrl = `/api/live-proxy/${match[1]}`
    return Response.json({ isLive: true, proxyUrl })
  } catch {
    return Response.json({ isLive: false })
  }
}
