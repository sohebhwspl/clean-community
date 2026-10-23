import { eventRegistrations } from '@/server/cleanup'
import { pathId, route } from '@/server/http'

export const GET = route({ auth: ['ADMIN'] }, ({ params }) => eventRegistrations(pathId(params)))
