import { pathId, route } from '@/server/http'
import { deleteImage } from '@/server/images'

export const DELETE = route({ auth: 'any' }, async ({ params, user }) => {
  await deleteImage(pathId(params), pathId(params, 'imageId'), user!)
})
