import { updateUser } from '@/server/admin'
import { pathId, readJson, route } from '@/server/http'
import { userUpdateSchema } from '@/server/schemas'

export const PATCH = route({ auth: ['ADMIN'] }, async ({ req, params, user }) =>
  updateUser(pathId(params), await readJson(req, userUpdateSchema), user!),
)
