import bcrypt from 'bcryptjs'
import { jwtVerify, SignJWT } from 'jose'
import type { NextRequest, NextResponse } from 'next/server'
import { User, type Role, type UserDoc } from './models'

export const COOKIE_NAME = 'cc_token'
const LIFETIME_SECONDS = 24 * 60 * 60

export interface AuthUser {
  id: number
  email: string
  role: Role
}

function key() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export const hashPassword = (p: string) => bcrypt.hash(p, 10)
export const checkPassword = (p: string, hash: string) => bcrypt.compare(p, hash)

export async function createToken(user: { _id: number; role: Role }) {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(user._id))
    .setIssuedAt()
    .setExpirationTime(`${LIFETIME_SECONDS}s`)
    .sign(key())
}

/** JWT in an HttpOnly cookie. The user is re-loaded on every request, so role changes and disabled accounts apply at once. */
export function setLoginCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: LIFETIME_SECONDS,
  })
  return res
}

export function clearLoginCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 })
  return res
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ['HS256'] })
    const id = Number(payload.sub)
    if (!Number.isInteger(id)) return null
    const u = await User.findById(id)
      .select('email role enabled')
      .lean<Pick<UserDoc, '_id' | 'email' | 'role' | 'enabled'>>()
    if (!u || !u.enabled) return null
    return { id: u._id, email: u.email, role: u.role as Role }
  } catch {
    return null
  }
}

export const isAdmin = (u: AuthUser) => u.role === 'ADMIN'
