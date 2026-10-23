import { cancelRegistration, registerForEvent } from '@/server/cleanup'
import { pathId, route } from '@/server/http'

export const POST = route({ auth: 'any' }, ({ params, user }) => registerForEvent(pathId(params), user!))

export const DELETE = route({ auth: 'any' }, ({ params, user }) => cancelRegistration(pathId(params), user!))
