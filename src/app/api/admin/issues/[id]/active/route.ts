import { setIssueActive } from '@/server/admin'
import { pathId, readJson, route } from '@/server/http'
import { activeSchema } from '@/server/schemas'

export const PATCH = route({ auth: ['ADMIN'] }, async ({ req, params }) =>
  setIssueActive(pathId(params), (await readJson(req, activeSchema)).active),
)
