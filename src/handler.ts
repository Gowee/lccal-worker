import { LCApi } from './lcapi'
import { generateCalendar } from './calgen'
import { cached } from './utils'
import { generateSvg } from './svggen'

export async function handleEvent(event: FetchEvent): Promise<Response> {
  const request = event.request
  const url = new URL(request.url)
  switch (url.pathname) {
    case '/':
      return new Response(
        `The iCal service has been moved to the endpoint "/ical".
The old default endpoint "/" is deprecated and may be removed in the future.
`,
        { status: 302, headers: { Location: '/ical' } },
      )
    case '/ical':
      return await cached(handleICal, 1200)(event)
      break
    case '/svg':
      return await cached(handleSvg, 1200)(event)
    default:
      return new Response(
        `Resource Not Found at the endpoint ${url.pathname}`,
        { status: 404 },
      )
  }
}

async function handleICal(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams
  const { offset, limit, region, timezone, nodownload } = extractCommonParams(
    params,
  )
  const lc = new LCApi(region)
  const contests = await lc.fetchContests()
  // Not necessary to specify timeZone here, as it produces standard date format.
  const ical = generateCalendar(
    contests,
    lc.getContestUrl,
    offset,
    limit,
    timezone,
    request.url,
  )
  return new Response(ical, { headers: headers_for('ical', nodownload) })
}

async function handleSvg(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams
  const { offset, limit, region, timezone, nodownload } = extractCommonParams(
    params,
  )
  const width = params.get('width')
  const height = params.get('height')
  const lc = new LCApi(region)
  const contests = await lc.fetchContests()
  const svg = generateSvg(
    contests,
    lc.getContestUrl,
    offset,
    limit,
    width,
    height,
    timezone,
    request.url,
  )
  return new Response(svg, { headers: headers_for('svg', nodownload) })
}

function headers_for(kind: 'svg' | 'ical', nodownload?: boolean) {
  let contentType
  let filename
  switch (kind) {
    case 'ical':
      // Some browser doesn't follow disposition type for text/calendar. So dirty fix it here.
      contentType = !nodownload ? 'text/calendar' : 'text/plain'
      filename = 'leetcode-contests.ics'
      break
    case 'svg':
      contentType = 'image/svg+xml'
      filename = 'leetcode-contests.svg'
      break
  }
  const dispositionType = 'inline'; //!nodownload ? 'attachment' : 'inline'
  return {
    'Content-Type': `${contentType}; charset=utf-8` /* ; method=PUBLISH */,
    'Content-Disposition': `${dispositionType}; filename="${filename}"`,
  }
}

interface CommonParams {
  offset: number
  limit: number
  region?: string | null
  timezone?: string | null
  nodownload: boolean
}

function extractCommonParams(params: URLSearchParams): CommonParams {
  const offset = parseInt(params.get('offset') || '0')
  const limit = parseInt(params.get('limit') || '10')
  const region = params.get('region')
  let nodownload
  if (
    [null, undefined, 'false', '0'].some(
      (falsyValue) => params.get('nodownload') === falsyValue,
    )
  ) {
    nodownload = false
  } else {
    nodownload = true
  }
  // If timezone is not specified and if region is CN, Asia/Shanghai will be used as default.
  const timezone =
    params.get('timezone') || (region === 'CN' ? 'Asia/Shanghai' : undefined)
  return {
    offset,
    limit,
    region,
    timezone,
    nodownload,
  }
}
