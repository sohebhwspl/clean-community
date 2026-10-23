import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'
import type { z } from 'zod'
import { hashPassword } from './auth'
import { ApiError } from './http'
import { sendMail } from './mailer'
import { PasswordReset, User } from './models'
import type { forgotPasswordSchema, resetPasswordSchema } from './schemas'

const OTP_MINUTES = 10
const RESEND_SECONDS = 60
const MAX_ATTEMPTS = 5

const hashOtp = (email: string, otp: string) =>
  createHmac('sha256', process.env.JWT_SECRET ?? '').update(`${email}:${otp}`).digest('hex')

function sameHash(a: string, b: string) {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

/** Always answers the same way, so the endpoint cannot be used to find out which emails have accounts. */
export async function requestOtp(req: z.output<typeof forgotPasswordSchema>) {
  const email = req.email.toLowerCase()
  const user = await User.findOne({ email }).select('name enabled role').lean()
  // Admins cannot reset by email, so a hacked mailbox cannot take over the site (see scripts/reset-admin-password.mjs).
  if (!user || !user.enabled || user.role === 'ADMIN') return

  const existing = await PasswordReset.findOne({ email }).lean()
  // Too soon after the last code: quietly do nothing, so the answer is identical for every email.
  if (existing && Date.now() - existing.createdAt.getTime() < RESEND_SECONDS * 1000) return

  const otp = String(randomInt(0, 1_000_000)).padStart(6, '0')
  await PasswordReset.findOneAndUpdate(
    { email },
    {
      otpHash: hashOtp(email, otp),
      attempts: 0,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + OTP_MINUTES * 60 * 1000),
    },
    { upsert: true },
  )
  await sendMail(
    email,
    'Your Clean Community password reset code',
    `Hi ${user.name},\n\nYour verification code is ${otp}.\nIt expires in ${OTP_MINUTES} minutes. If you did not ask for this, you can ignore this email.\n\nClean Community`,
  )
}

export async function resetPassword(req: z.output<typeof resetPasswordSchema>) {
  const email = req.email.toLowerCase()
  const invalid = new ApiError(400, 'Invalid or expired code')

  const reset = await PasswordReset.findOne({ email })
  if (!reset || reset.expiresAt.getTime() < Date.now()) throw invalid
  if (reset.attempts >= MAX_ATTEMPTS) {
    await PasswordReset.deleteOne({ email })
    throw new ApiError(429, 'Too many wrong attempts. Please request a new code')
  }
  if (!sameHash(reset.otpHash, hashOtp(email, req.otp))) {
    await PasswordReset.updateOne({ email }, { $inc: { attempts: 1 } })
    throw invalid
  }

  await User.updateOne({ email, role: { $ne: 'ADMIN' } }, { passwordHash: await hashPassword(req.newPassword) })
  await PasswordReset.deleteOne({ email })
}
