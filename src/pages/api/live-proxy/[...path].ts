import type { APIRoute } from 'astro'

export const prerender = false

const ALLOWED = /^live-[a-z0-9-]+\.mixcloud\.com$/

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Range',
}

export const OPTIONS: APIRoute = async () =>
  new Response(null, { status: 204, headers: CORS })

export const GET: APIRoute = async ({ params, request }) => {
  const fullPath = params.path ?? ''
  const slash    = fullPath.indexOf('/')
  const host     = slash >= 0 ? fullPath.slice(0, slash) : fullPath
  const rest     = slash >= 0 ? fullPath.slice(slash)    : '/'

  if (!ALLOWED.test(host)) {
    return new Response('Forbidden', { status: 403, headers: CORS })
  }

  const upstream    = `https://${host}${rest}`
  const rangeHeader = request.headers.get('Range')
  const fetchHeaders: HeadersInit = {
    'User-Agent': 'Mozilla/5.0 (compatible; RadioElastica/1.0)',
  }
  if (rangeHeader) fetchHeaders['Range'] = rangeHeader

  let res: Response
  try {
    res = await fetch(upstream, { headers: fetchHeaders })
  } catch {
    return new Response('Upstream unreachable', { status: 502, headers: CORS })
  }

  if (!res.ok) {
    return new Response('Upstream error', { status: res.status, headers: CORS })
  }

  const contentType = res.headers.get('Content-Type') ?? 'application/octet-stream'
  // Segments (.ts) are immutable — cache aggressively. Manifests (.m3u8) change every few seconds.
  const isSegment   = fullPath.endsWith('.ts')
  const cacheHeader = isSegment ? 'public, max-age=3600, immutable' : 'no-cache, no-store'
  const responseHeaders: Record<string, string> = {
    ...CORS,
    'Content-Type':  contentType,
    'Cache-Control': cacheHeader,
  }
  const cl = res.headers.get('Content-Length')
  const cr = res.headers.get('Content-Range')
  if (cl) responseHeaders['Content-Length'] = cl
  if (cr) responseHeaders['Content-Range']  = cr

  return new Response(res.body, { status: res.status, headers: responseHeaders })
}
