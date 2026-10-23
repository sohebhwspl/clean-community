import { NextResponse } from 'next/server'
import { login, toUser } from '@/server/accounts'
import { createToken, setLoginCookie } from '@/server/auth'
import { readJson, route } from '@/server/http'
import { loginSchema } from '@/server/schemas'

export const POST = route({}, async ({ req }) => {
  const u = await login(await readJson(req, loginSchema))
  return setLoginCookie(NextResponse.json(toUser(u)), await createToken(u))
})
