# lccal-worker

A script that generates 📅 [iCal/ics](https://tools.ietf.org/html/rfc5545) for Leetcode (Bi)Weekly Contests, deployed on Cloudflare Workes: [https://lccal-worker.bamboo.workers.dev/ical](https://lccal-worker.bamboo.workers.dev/ical).

## iCal generator
**Endpoint**: [`/ical`](https://lccal-worker.bamboo.workers.dev/ical)

A subscribable [iCal/ics](https://tools.ietf.org/html/rfc5545) file.

For example, add `https://lccal-worker.bamboo.workers.dev/ical` to Google Calendar via https://calendar.google.com/calendar/r/settings/addbyurl. Then it will get updated automatically when there are new contests.

Most other calendar services also support subscribing by URL: https://duck.com/?q=how+to+subscribe+ical+by+url .

## SVG generator
**Endpoint**: [`/svg`](https://lccal-worker.bamboo.workers.dev/svg)

An auto-generated SVG for fun.

| Name | Description |
|-|-|
| width | The size of the generated SVG. `300` by default. |
| height | The size of the generated SVG. `auto` by default. |

For example:

[![SVG](https://lccal-worker.bamboo.workers.dev/svg?width=180&limit=5)](https://lccal-worker.bamboo.workers.dev/svg?width=300&limit=5)
[![SVG](https://lccal-worker.bamboo.workers.dev/svg?width=180&offset=5&limit=5&timezone=Asia/Shanghai)](https://lccal-worker.bamboo.workers.dev/svg?width=300&height=auto&offset=5&limit=5&region=CN&timezone=Asia/Shanghai)
.

## Other params
The following URL query params are for both of the two endpoint above.

| Name | Description |
|-|-|
| offset | N-th contests, in descending order of time, to start. `0` by default. |
| limit | The number of contests to get. `10` by default. |
| region | LeetCode's data region, either `US` or `CN`. `US` by default. |
| timezone | Timezone to use in calendar. `Asia/Shanghai` by default when `region=CN`. `UTC` O.W. |
| download | When present and not `false` or `0`, instruct the browser to save the generated file. |
