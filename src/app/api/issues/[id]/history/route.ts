import { pathId, route } from '@/server/http'
import { issueHistory } from '@/server/issues'

export const GET = route({}, ({ params, user }) => issueHistory(pathId(params), user))
