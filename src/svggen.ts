import { LCCUrl, Contest } from './lcapi'
import { duration2hms, xmlEscape } from './utils'

function urlJoin(base: string, url: string): string {
  const absUrl = new URL(url, base)
  return absUrl.toString()
}

export function generateSvg(
  contests: Array<Contest>,
  offset = 0,
  limit = 10,
  timeZone: String | null = null,
  width: number | string | null,
  height: number | string | null,
): string {
  const compositor = new Compositor(timeZone, width, height)
  return compositor.draw(contests.slice(offset, offset + limit))
}

class Compositor {
  timeZone: String
  width: number | string
  height: number | string

  constructor(
    timeZone: String | null,
    width: number | string | null = null,
    height: number | string | null = null,
  ) {
    this.timeZone = timeZone || 'UTC'
    this.width = width || '300'
    this.height = height || 'auto'
  }

  draw(contests: Array<Contest>): string {
    return `\
<svg xmlns="http://www.w3.org/2000/svg" width="${xmlEscape(
      this.width,
    )}" height="${xmlEscape(this.height)}" viewBox="0 0 300 ${
      contests.length * 90
    }">
  <metadata>
    <rdf:RDF
      xmlns:rdf = "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
      xmlns:rdfs = "http://www.w3.org/2000/01/rdf-schema#"
      xmlns:dc = "http://purl.org/dc/elements/1.1/" >
      <rdf:Description about="https://${LCCUrl}/contests"
        dc:title="LeetCode Weekly contests canlenadr"
        dc:description="An auto-generated calendar for LeetCode (Bi)Weekly contests"
        dc:publisher="https://github.com/Gowee/lccal-worker"
        dc:date="${new Date().toISOString()}"
        dc:format="image/svg+xml"
        dc:language="en" />
    </rdf:RDF>
  </metadata>
  <defs>
    <linearGradient id="yellowGradient" gradientTransform="rotate(87)">
      <stop offset="5%" stop-color="#fffc43" />
      <stop offset="95%" stop-color="#ffd479" />
    </linearGradient>
    <linearGradient id="blueGradient" gradientTransform="rotate(87)">
      <stop offset="5%" stop-color="#4fe3f8" />
      <stop offset="95%" stop-color="#0e99d0" />
    </linearGradient>
  </defs>
  <style>
    .contest-title {
      font: bold 1.3em sans-serif;
    }
    a:hover { 
      text-decoration: underline;
    }
  </style>
  ${contests.map((entry, index) => this.contest(entry, index)).join('\n')}
</svg>`
  }

  contest(contest: Contest, nth = 0): string {
    return this.contestWrapper(this.contestContent(contest), 90 * nth)
  }

  contestContent(contest: Contest): string {
    let gradient
    if (contest.titleSlug.indexOf('biweekly') === -1) {
      gradient = '#yellowGradient'
    } else {
      gradient = '#blueGradient'
    }
    return `\
    <rect width="300" height="87" fill="url('${gradient}')" rx="15" />
      <a href="${xmlEscape(urlJoin(LCCUrl, contest.titleSlug))}">
      <text x="15" y="30" class="contest-title">
        ${xmlEscape(contest.title)}
      </text>
      <text x="15" y="50">
        ${this.datetimeText(contest.startTime, contest.duration)}
      </text>
      <text x="15" y="68">
        ${this.durationText(contest.duration)} contest
      </text>
    </a>`
  }

  contestWrapper(inner: string, y_offset = 0): string {
    return `\
    <g transform="translate(0, ${y_offset})">
    ${inner}
    </g>
`
  }

  datetimeText(startTime: number, duration: number) {
    // https://stackoverflow.com/questions/60081960/type-error-with-options-in-date-prototype-tolocaledatestring
    // const start = new Date(startTime * 1000)
    // console.log(new Intl.DateTimeFormat('en-US', {
    //   dateStyle: 'medium',
    //   timeStyle: 'short',
    //   timeZone,
    // } as any).resolvedOptions().timeZone)
    const startDate = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: this.timeZone,
    } as any).format(new Date(startTime * 1000))
    const endTime = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: this.timeZone,
    } as any)
      .format(new Date((startTime + duration) * 1000))
      .split(',')
      .slice(-1)[0]
    const text = `${startDate} - ${endTime}`
    const sep = text.lastIndexOf(',')
    return text.slice(0, sep) + ' @' + text.slice(sep + 1)
  }

  durationText(duration: number): string {
    const [h, m, s] = duration2hms(duration)
    let pieces = []
    if (h > 0) {
      pieces.push(`${h} hour${h > 1 ? 's' : ''}`)
    }
    if (m > 0 || pieces.length > 0) {
      pieces.push(`${m} minute${m !== 1 ? 's' : ''}`)
    }
    if (s > 0 || pieces.length === 0) {
      pieces.push(`${s} second${s > 1 ? 's' : ''}`)
    } else if (pieces.length == 2 && m === 0) {
      pieces.pop()
    }
    return pieces.join(' ')
  }
}
