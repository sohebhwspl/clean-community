import { createEvent, listEvents } from '@/server/cleanup'
import { created, enumParam, readJson, route } from '@/server/http'
import { EVENT_STATUSES } from '@/server/models'
import { eventSchema } from '@/server/schemas'

export const GET = route({}, ({ req, user }) =>
  listEvents(enumParam(new URL(req.url), 'status', EVENT_STATUSES), user),
)

export const POST = route({ auth: ['ADMIN'] }, async ({ req, user }) =>
  created(await createEvent(await readJson(req, eventSchema), user!)),
)
