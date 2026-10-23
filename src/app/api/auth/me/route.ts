import { me, toUser, updateProfile } from '@/server/accounts'
import { readJson, route } from '@/server/http'
import { profileSchema } from '@/server/schemas'

export const GET = route({ auth: 'any' }, async ({ user }) => toUser(await me(user!)))

export const PATCH = route({ auth: 'any' }, async ({ req, user }) =>
  toUser(await updateProfile(user!, await readJson(req, profileSchema))),
)
