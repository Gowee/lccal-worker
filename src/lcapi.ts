import * as PACKAGE from '../package.json'
import { urlJoin } from './utils'

export interface Contest {
  title: string
  titleSlug: string
  cardImg?: string | null
  description: string
  startTime: number
  duration: number
  originStartTime: number
  isVirtual: boolean
  company?: Company | null
  containsPremium: boolean
}

export interface Company {
  watermark?: string | null
}

const JSON_REQUEST_HEADERS = {
  'User-Agent': `lccal-worker/0.1 (+${PACKAGE.homepage})`,
  // "Accept": "*/*",
  // "Accept-Language": "en-US,en;q=0.5",
  'content-type': 'application/json',
}

export class LCApi {
  baseUrl: string

  constructor(dataRegion?: string | null) {
    switch (dataRegion) {
      case 'CN':
        this.baseUrl = "https://leetcode-cn.com/"
        break
      case 'US':
      default:
        this.baseUrl = "https://leetcode.com/"
    }

    // this.fetchContests = this.fetchContests.bind(this)
    this.getContestUrl = this.getContestUrl.bind(this)
  }

  async fetchContests(
    start = 0,
    offset = 0,
  ): Promise<Array<Contest>> {
    // TODO: Does the `allContests` GraphQL query support limit / offset?
    const response = await fetch(urlJoin(this.baseUrl, '/graphql'), {
      headers: JSON_REQUEST_HEADERS,
      body:
        '{"operationName":null,"variables":{},"query":"{\\n  brightTitle\\n  allContests {\\n    containsPremium\\n    title\\n    cardImg\\n    titleSlug\\n    description\\n    startTime\\n    duration\\n    originStartTime\\n    isVirtual\\n    company {\\n      watermark\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n"}',
      method: 'POST',
    })
    const data = await response.json()
    const contests: Array<Contest> = data.data.allContests
    return contests
  }

  /**
   * Get the URL of a specific contest by its titleSlug, or the weekly contest homepage if
   * titleSlug is unspecified.
   */
  getContestUrl(titleSlug?: string): string {
    let url = urlJoin(this.baseUrl, "/contest/")
    if (titleSlug) {
      url = urlJoin(url, titleSlug)
    }
    return url
  }
}
