import { readJson, route } from '@/server/http'
import { requestOtp } from '@/server/passwordReset'
import { forgotPasswordSchema } from '@/server/schemas'

export const POST = route({}, async ({ req }) => {
  await requestOtp(await readJson(req, forgotPasswordSchema))
  return { message: 'If an account exists for this email, a verification code has been sent.' }
})
