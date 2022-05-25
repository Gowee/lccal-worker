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
    method: 'PUBLISH',
    url: serviceUrl || PACKAGE.iCalService + '?from_unknown_service_instance',
    timezone: timezone || undefined,
  })
  for (const contest of contests.slice(offset, offset + limit)) {
    cal.createEvent({
      id: contest.titleSlug,
      start: new Date(contest.startTime * 1000),
      end: new Date((contest.startTime + contest.duration) * 1000),
      summary: `[Leetcode] ${contest.title}`,
      url: contestUrlGetter(contest.titleSlug),
      location: contestUrlGetter(contest.titleSlug),
      description: contest.description,
      alarms: [
        {
          trigger: 15 * 60,
          type: 'display',
          description: 'The contest is soon to start',
        },
      ],
    })
  }
  return cal.toString()
}
