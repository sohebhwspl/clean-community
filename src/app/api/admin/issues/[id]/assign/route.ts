import { assignIssue } from '@/server/admin'
import { pathId, readJson, route } from '@/server/http'
import { assignSchema } from '@/server/schemas'

export const POST = route({ auth: ['ADMIN'] }, async ({ req, params, user }) =>
  assignIssue(pathId(params), await readJson(req, assignSchema), user!),
)
