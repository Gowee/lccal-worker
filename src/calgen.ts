import * as PACKAGE from '../package.json'
import { Contest } from './lcapi'
import ICalGenerator from 'ical-generator'

function urlJoin(base: string, url: string): string {
  const absUrl = new URL(url, base)
  return absUrl.toString()
}

export function generateCalendar(
  contests: Array<Contest>,
  contestUrlGetter: (titleSlug?: string) => string,
  offset = 0,
  limit = 10,
  timezone?: string | null,
  serviceUrl?: string | null,
): string {
  const cal = ICalGenerator({
    domain: 'lccal-worker',
    name: 'LeetCode Contests',
    url: serviceUrl || PACKAGE.iCalService + '?from_unknown_service_instance',
    timezone: timezone || undefined,
  })
  for (const contest of contests.slice(offset, offset + limit)) {
    const ctsUrl = contestUrlGetter(contest.titleSlug)
    cal.createEvent({
      id: contest.titleSlug,
      start: new Date(contest.startTime * 1000),
      end: new Date((contest.startTime + contest.duration) * 1000),
      summary: `[Leetcode] ${contest.title}`,
      url: ctsUrl,
      location: ctsUrl,
    })
  }
  return cal.toString()
}
