import { route } from '@/server/http'
import { listTasks } from '@/server/volunteer'

export const GET = route({ auth: ['VOLUNTEER'] }, ({ req, user }) =>
  listTasks(user!, new URL(req.url).searchParams.get('completed') === 'true'),
)
