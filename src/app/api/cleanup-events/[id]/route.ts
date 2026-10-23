import { getEvent, updateEvent } from '@/server/cleanup'
import { pathId, readJson, route } from '@/server/http'
import { eventSchema } from '@/server/schemas'

export const GET = route({}, ({ params, user }) => getEvent(pathId(params), user))

export const PATCH = route({ auth: ['ADMIN'] }, async ({ req, params, user }) =>
  updateEvent(pathId(params), await readJson(req, eventSchema), user!),
)
