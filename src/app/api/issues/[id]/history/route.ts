import { pathId, route } from '@/server/http'
import { issueHistory } from '@/server/issues'

export const GET = route({}, ({ params }) => issueHistory(pathId(params)))
