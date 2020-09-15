export const LCCUrl = 'https://leetcode.com/contest/'

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

export async function fetchContests(
  start = 0,
  offset = 0,
): Promise<Array<Contest>> {
  // TODO: Does the `allContests` GraphQL query support limit / offset?
  const response = await fetch('https://leetcode.com/graphql', {
    headers: {
      'User-Agent': 'lccal-worker/0.1 (+https://github.com/Gowee/lccal-worker)',
      // "Accept": "*/*",
      // "Accept-Language": "en-US,en;q=0.5",
      'content-type': 'application/json',
    },
    body:
      '{"operationName":null,"variables":{},"query":"{\\n  brightTitle\\n  allContests {\\n    containsPremium\\n    title\\n    cardImg\\n    titleSlug\\n    description\\n    startTime\\n    duration\\n    originStartTime\\n    isVirtual\\n    company {\\n      watermark\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n"}',
    method: 'POST',
  })
  const data = await response.json()
  const contests: Array<Contest> = data.data.allContests
  return contests
}
