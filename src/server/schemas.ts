import { z } from 'zod'
import { CATEGORIES, EVENT_STATUSES, PRIORITIES, ROLES } from './models'

const text = (max: number) =>
  z
    .string({ error: 'must not be blank' })
    .trim()
    .min(1, 'must not be blank')
    .max(max, `size must be between 0 and ${max}`)

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `size must be between 0 and ${max}`)
    .nullish()
    .transform((v) => (v ? v : null))

const required = { error: 'must not be null' }

export const registerSchema = z.object({
  name: text(100),
  email: z.string({ error: 'must not be blank' }).trim().min(1, 'must not be blank').max(150).email('must be a well-formed email address'),
  password: z.string({ error: 'must not be blank' }).min(6, 'size must be between 6 and 72').max(72, 'size must be between 6 and 72'),
  phone: optionalText(20),
  role: z.enum(ROLES).nullish(),
})

export const loginSchema = z.object({
  email: z.string({ error: 'must not be blank' }).trim().min(1, 'must not be blank').email('must be a well-formed email address'),
  password: z.string({ error: 'must not be blank' }).min(1, 'must not be blank'),
})

export const profileSchema = z.object({ name: text(100), phone: optionalText(20) })

export const issueSchema = z.object({
  title: text(150),
  category: z.enum(CATEGORIES, required),
  description: text(2000),
  location: text(200),
  landmark: optionalText(200),
  priority: z.enum(PRIORITIES).nullish(),
})

export const reviewSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT', 'DUPLICATE']).nullish(),
  reason: z.string().max(500, 'size must be between 0 and 500').nullish(),
  priority: z.enum(PRIORITIES).nullish(),
})

export const assignSchema = z.object({
  volunteerId: z.number(required),
  notes: z.string().max(1000, 'size must be between 0 and 1000').nullish(),
})

export const verifySchema = z.object({
  approved: z.boolean(required),
  note: z.string().max(500, 'size must be between 0 and 500').nullish(),
})

export const userUpdateSchema = z.object({ role: z.enum(ROLES).nullish(), enabled: z.boolean().nullish() })

export const taskStatusSchema = z.object({
  action: z.enum(['START', 'COMPLETE'], required),
  note: z.string().max(500, 'size must be between 0 and 500').nullish(),
})

export const eventSchema = z.object({
  title: text(150),
  description: text(2000),
  date: z.string(required).regex(/^\d{4}-\d{2}-\d{2}$/, 'must be a valid date'),
  time: z
    .string(required)
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'must be a valid time')
    .transform((t) => t.slice(0, 5)),
  location: text(200),
  status: z.enum(EVENT_STATUSES).nullish(),
})

const emailField = z.string({ error: 'must not be blank' }).trim().min(1, 'must not be blank').email('must be a well-formed email address')

export const forgotPasswordSchema = z.object({ email: emailField })

export const resetPasswordSchema = z.object({
  email: emailField,
  otp: z.string({ error: 'must not be blank' }).trim().regex(/^\d{6}$/, 'must be a 6-digit code'),
  newPassword: z.string({ error: 'must not be blank' }).min(6, 'size must be between 6 and 72').max(72, 'size must be between 6 and 72'),
})
