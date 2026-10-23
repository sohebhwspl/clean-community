import { readJson, route } from '@/server/http'
import { resetPassword } from '@/server/passwordReset'
import { resetPasswordSchema } from '@/server/schemas'

export const POST = route({}, async ({ req }) => {
  await resetPassword(await readJson(req, resetPasswordSchema))
  return { message: 'Password updated. You can now log in.' }
})
