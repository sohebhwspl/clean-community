import { intParam, route } from '@/server/http'
import { myIssues } from '@/server/issues'

export const GET = route({ auth: 'any' }, async ({ req, user }) => {
  const url = new URL(req.url)
  return myIssues(user!, intParam(url, 'page', 0), intParam(url, 'size', 9))
})
