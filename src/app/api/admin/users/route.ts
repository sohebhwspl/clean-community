import { listUsers } from '@/server/admin'
import { enumParam, route } from '@/server/http'
import { ROLES } from '@/server/models'

export const GET = route({ auth: ['ADMIN'] }, ({ req }) => listUsers(enumParam(new URL(req.url), 'role', ROLES)))
