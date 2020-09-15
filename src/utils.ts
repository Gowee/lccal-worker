export function cached(func: (request: Request) => Promise<Response>) {
  // Ref: https://github.com/cloudflare/template-registry/blob/f2a21ff87a4f9c60ce1d426e9e8d2e6807b786fd/templates/javascript/cache_api.js#L9
  const cache = caches.default
  async function cachedFunc(event: FetchEvent) {
    const request = event.request
    let response = await cache.match(request)
    if (!response) {
      response = await func(request)
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
