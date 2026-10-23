import { reviewIssue } from '@/server/admin'
import { pathId, readJson, route } from '@/server/http'
import { reviewSchema } from '@/server/schemas'

export const PATCH = route({ auth: ['ADMIN'] }, async ({ req, params, user }) =>
  reviewIssue(pathId(params), await readJson(req, reviewSchema), user!),
)
