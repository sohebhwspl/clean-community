import { enumParam, intParam, route } from '@/server/http'
import { searchIssues } from '@/server/issues'
import { CATEGORIES, PRIORITIES, STATUSES } from '@/server/models'

export const GET = route({ auth: ['ADMIN'] }, async ({ req }) => {
  const url = new URL(req.url)
  return searchIssues(
    {
      q: url.searchParams.get('q'),
      category: enumParam(url, 'category', CATEGORIES),
      status: enumParam(url, 'status', STATUSES),
      priority: enumParam(url, 'priority', PRIORITIES),
    },
    intParam(url, 'page', 0),
    intParam(url, 'size', 10),
  )
})
