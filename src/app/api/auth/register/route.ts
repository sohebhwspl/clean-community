import { NextResponse } from 'next/server'
import { register } from '@/server/accounts'
import { createToken, setLoginCookie } from '@/server/auth'
import { readJson, route } from '@/server/http'
import { toUser } from '@/server/accounts'
import { registerSchema } from '@/server/schemas'

export const POST = route({}, async ({ req }) => {
  const u = await register(await readJson(req, registerSchema))
  return setLoginCookie(NextResponse.json(toUser(u), { status: 201 }), await createToken(u))
})
