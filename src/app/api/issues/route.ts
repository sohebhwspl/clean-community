import { created, enumParam, intParam, readJson, route } from '@/server/http'
import { createIssue, searchIssues } from '@/server/issues'
import { CATEGORIES, PRIORITIES, STATUSES } from '@/server/models'
import { issueSchema } from '@/server/schemas'

export const GET = route({}, async ({ req }) => {
  const url = new URL(req.url)
  return searchIssues(
    {
      q: url.searchParams.get('q'),
      category: enumParam(url, 'category', CATEGORIES),
      status: enumParam(url, 'status', STATUSES),
      priority: enumParam(url, 'priority', PRIORITIES),
    },
    intParam(url, 'page', 0),
    intParam(url, 'size', 9),
  )
})

export const POST = route({ auth: 'any' }, async ({ req, user }) =>
  created(await createIssue(await readJson(req, issueSchema), user!)),
)
