import { created, enumValue, pathId, route } from '@/server/http'
import { filesFrom, uploadImages } from '@/server/images'
import { IMAGE_TYPES } from '@/server/models'

export const POST = route({ auth: 'any' }, async ({ req, params, user }) => {
  const form = await req.formData()
  const type = enumValue(form.get('type'), 'type', IMAGE_TYPES) ?? 'BEFORE'
  return created(await uploadImages(pathId(params), type, filesFrom(form), user!))
})
