import { fetchContests } from './lcapi'
import { generateCalendar } from './calgen'

const ICALHEADERS = {
  'Contest-Type': 'text/calendar; charset=utf-8',
  'Content-Disposition': `attachment; filename="leetcode-contests.ical"`,
}

export async function handleRequest(request: Request): Promise<Response> {
  const contests = await fetchContests()
  const ical = generateCalendar(contests)
  return new Response(ical, { headers: ICALHEADERS })
}
