import { LCCUrl, Contest } from './lcapi'
import ICalGenerator from 'ical-generator'

function urlJoin(base: string, url: string): string {
  const absUrl = new URL(url, base)
  return absUrl.toString()
}

export function generateCalendar(
  contests: Array<Contest>,
  offset = 0,
  limit = 10,
): string {
  const cal = ICalGenerator({
    domain: 'lccal-worker',
    name: 'LeetCode Contests',
    url: LCCUrl,
  })
  for (const contest of contests.slice(offset, offset + limit)) {
    cal.createEvent({
      id: contest.titleSlug,
      start: new Date(contest.startTime * 1000),
      end: new Date((contest.startTime + contest.duration) * 1000),
      summary: `[Leetcode] ${contest.title}`,
      url: urlJoin(LCCUrl, contest.titleSlug),
    })
  }
  return cal.toString()
}
