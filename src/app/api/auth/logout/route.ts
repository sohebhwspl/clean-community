import { NextResponse } from 'next/server'
import { clearLoginCookie } from '@/server/auth'
import { route } from '@/server/http'

export const POST = route({}, async () => clearLoginCookie(new NextResponse(null, { status: 204 })))
