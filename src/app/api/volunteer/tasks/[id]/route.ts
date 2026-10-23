import { pathId, route } from '@/server/http'
import { getTask } from '@/server/volunteer'

export const GET = route({ auth: ['VOLUNTEER'] }, ({ params, user }) => getTask(pathId(params), user!))
