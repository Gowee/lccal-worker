import { handleEvent } from './handler'

addEventListener('fetch', (event) => {
  event.respondWith(handleEvent(event))
})
