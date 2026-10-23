import { enumValue, pathId, route } from '@/server/http'
import { filesFrom } from '@/server/images'
import { IMAGE_TYPES } from '@/server/models'
import { addProgress } from '@/server/volunteer'

export const POST = route({ auth: ['VOLUNTEER'] }, async ({ req, params, user }) => {
  const form = await req.formData()
  const type = enumValue(form.get('type'), 'type', IMAGE_TYPES) ?? 'PROGRESS'
  const note = form.get('note')
  return addProgress(pathId(params), typeof note === 'string' ? note : null, type, filesFrom(form), user!)
})
