import { fetchContests } from './lcapi'
import { generateCalendar } from './calgen'
import { cached } from './utils'
import { generateSvg } from './svggen'

const HEADERS_ICAL = {
  'Contest-Type': 'text/calendar; charset=utf-8',
  'Content-Disposition': `attachment; filename="leetcode-contests.ical"`,
}

const HEADERS_SVG = {
  'Content-Type': 'image/svg+xml',
  'Content-Disposition': `inline; filename="leetcode-contests.svg"`,
}

export async function handleEvent(event: FetchEvent): Promise<Response> {
  const request = event.request
  const url = new URL(request.url)
  switch (url.pathname) {
    case '/':
    case '/ical':
      return await cached(handleICal)(event)
      break
    case '/svg':
      return await cached(handleSvg)(event)
    default:
      return new Response(
        `Resource Not Found at the endpoint ${url.pathname}`,
        { status: 404 },
      )
  }
}

async function handleICal(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams
  const limit = parseInt(params.get('limit') || '10')
  const contests = await fetchContests()
  // Not necessary to specify timeZone here, as it produces standard date format.
  const ical = generateCalendar(contests, limit)
  return new Response(ical, { headers: HEADERS_ICAL })
}

async function handleSvg(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams
  const timeZone = params.get('timezone')
  const limit = parseInt(params.get('limit') || '10')
  const contests = await fetchContests()
  const ical = generateSvg(contests, limit, timeZone)
  return new Response(ical, { headers: HEADERS_SVG })
}
