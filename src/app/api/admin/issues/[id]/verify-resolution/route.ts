import { verifyResolution } from '@/server/admin'
import { pathId, readJson, route } from '@/server/http'
import { verifySchema } from '@/server/schemas'

export const PATCH = route({ auth: ['ADMIN'] }, async ({ req, params, user }) =>
  verifyResolution(pathId(params), await readJson(req, verifySchema), user!),
)
