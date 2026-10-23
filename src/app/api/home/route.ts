import { route } from '@/server/http'
import { loadHome } from '@/server/home'

export const GET = route({}, () => loadHome())
