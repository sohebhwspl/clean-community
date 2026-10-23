import { dashboard } from '@/server/admin'
import { route } from '@/server/http'

export const GET = route({ auth: ['ADMIN'] }, () => dashboard())
