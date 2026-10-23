import type { z } from 'zod'
import { checkPassword, hashPassword, type AuthUser } from './auth'
import { ApiError } from './http'
import { nextId } from './ids'
import { User, type UserDoc } from './models'
import type { loginSchema, profileSchema, registerSchema } from './schemas'

export const toUser = (u: UserDoc) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone ?? null,
  role: u.role,
  enabled: u.enabled,
  createdAt: u.createdAt,
})

export async function register(req: z.output<typeof registerSchema>) {
  const email = req.email.trim().toLowerCase()
  if (await User.exists({ email })) throw ApiError.conflict('An account with this email already exists')
  try {
    const u = await User.create({
      _id: await nextId('users'),
      name: req.name,
      email,
      passwordHash: await hashPassword(req.password),
      phone: req.phone,
      role: req.role === 'VOLUNTEER' ? 'VOLUNTEER' : 'RESIDENT',
    })
    return u.toObject()
  } catch (err) {
    if ((err as { code?: number }).code === 11000) throw ApiError.conflict('An account with this email already exists')
    throw err
  }
}

export async function login(req: z.output<typeof loginSchema>) {
  const u = await User.findOne({ email: req.email.trim().toLowerCase() }).lean()
  if (!u || !(await checkPassword(req.password, u.passwordHash))) {
    throw new ApiError(401, 'Invalid email or password')
  }
  if (!u.enabled) throw ApiError.forbidden('This account is disabled')
  return u
}

export async function me(user: AuthUser) {
  const u = await User.findById(user.id).lean()
  if (!u) throw ApiError.notFound('User')
  return u
}

export async function updateProfile(user: AuthUser, req: z.output<typeof profileSchema>) {
  const u = await User.findByIdAndUpdate(user.id, { name: req.name, phone: req.phone }, { new: true }).lean()
  if (!u) throw ApiError.notFound('User')
  return u
}
