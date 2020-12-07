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
  const { offset, limit, region, timezone, download } = extractCommonParams(
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
  return new Response(ical, { headers: headers_for('ical', download) })
}

async function handleSvg(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams
  const { offset, limit, region, timezone, download } = extractCommonParams(
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
  return new Response(svg, { headers: headers_for('svg', download) })
}

function headers_for(kind: 'svg' | 'ical', download?: boolean) {
  let contentType
  let filename
  switch (kind) {
    case 'ical':
      // Some browser doesn't follow disposition type for text/calendar. So dirty fix it here.
      contentType = download ? 'text/calendar' : 'text/plain'
      filename = 'leetcode-contests.ical'
      break
    case 'svg':
      contentType = 'image/svg+xml'
      filename = 'leetcode-contests.svg'
      break
  }
  const dispositionType = download ? 'attachment' : 'inline'
  return {
    'Content-Type': `${contentType}; charset=utf-8`,
    'Content-Disposition': `${dispositionType}; filename="${filename}"`,
  }
}

interface CommonParams {
  offset: number
  limit: number
  region?: string | null
  timezone?: string | null
  download: boolean
}

function extractCommonParams(params: URLSearchParams): CommonParams {
  const offset = parseInt(params.get('offset') || '0')
  const limit = parseInt(params.get('limit') || '10')
  const region = params.get('region')
  let download
  if (
    [null, undefined, 'false', '0'].some(
      (falsyValue) => params.get('download') === falsyValue,
    )
  ) {
    download = false
  } else {
    download = true
  }
  // If timezone is not specified and if region is CN, Asia/Shanghai will be used as default.
  const timezone =
    params.get('timezone') || (region === 'CN' ? 'Asia/Shanghai' : undefined)
  return {
    offset,
    limit,
    region,
    timezone,
    download,
  }
}
