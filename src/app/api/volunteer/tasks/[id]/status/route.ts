import { pathId, readJson, route } from '@/server/http'
import { taskStatusSchema } from '@/server/schemas'
import { updateTaskStatus } from '@/server/volunteer'

export const PATCH = route({ auth: ['VOLUNTEER'] }, async ({ req, params, user }) =>
  updateTaskStatus(pathId(params), await readJson(req, taskStatusSchema), user!),
)
