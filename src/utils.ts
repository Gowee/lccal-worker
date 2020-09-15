import { XmlEntities } from 'html-entities'

export function cached(
  func: (request: Request) => Promise<Response>,
  maxAge: number | null,
) {
  // Ref: https://github.com/cloudflare/template-registry/blob/f2a21ff87a4f9c60ce1d426e9e8d2e6807b786fd/templates/javascript/cache_api.js#L9
  const cache = caches.default
  async function cachedFunc(event: FetchEvent) {
    const request = event.request
    let response = await cache.match(request)
    if (!response) {
      response = await func(request)
      if (maxAge !== null && !response.headers.has('Cache-Control')) {
        response.headers.append('Cache-Control', `max-age=${maxAge}`)
      }
      event.waitUntil(cache.put(request, response.clone()))
    }
    return response
  }
  return cachedFunc
}

export function duration2hms(duration: number): [number, number, number] {
  let h, m, s
  ;[h, duration] = divmod(duration, 3600)
  ;[m, s] = divmod(duration, 60)
  return [h, m, s]
}

export function divmod(a: number, b: number): [number, number] {
  return [Math.floor(a / b), a % b]
}

const xmlEscaper = new XmlEntities()

export function xmlEscape(
  text: string | number | null | undefined | boolean,
): string | number | null | undefined | boolean {
  if (
    text === null ||
    text === undefined ||
    typeof text === 'number' ||
    typeof text === 'boolean'
  ) {
    return text
  } else {
    return xmlEscaper.encode(text)
  }
}

export function santinizeWidthHeight(
  value: string | number | null,
): string | number | null {
  // doesn't work as parseInt("100abc") === 100
  if (
    value === null ||
    typeof value === 'number' ||
    parseInt(value) !== NaN ||
    value.toLowerCase() == 'auto' ||
    (value.endsWith('%') && parseInt(value.slice(0, value.length - 1)) !== NaN)
  ) {
    return value
  } else {
    return null
  }
}
