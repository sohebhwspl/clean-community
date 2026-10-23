import { pathId, readJson, route } from '@/server/http'
import { getIssueDetail, updateIssue } from '@/server/issues'
import { issueSchema } from '@/server/schemas'

export const GET = route({}, ({ params, user }) => getIssueDetail(pathId(params), user))

export const PATCH = route({ auth: 'any' }, async ({ req, params, user }) =>
  updateIssue(pathId(params), await readJson(req, issueSchema), user!),
)
