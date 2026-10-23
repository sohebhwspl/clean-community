import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { nextId } from './ids'
import { User } from './models'

const globalCache = globalThis as unknown as { __ccMongo?: { ready: Promise<void> | null } }
const cache = (globalCache.__ccMongo ??= { ready: null })

/**
 * Connects once per server instance and makes sure the first admin account exists.
 * The work is shared through one promise, so simultaneous first requests don't race.
 */
export function connectDb() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set')

  cache.ready ??= (async () => {
    await mongoose.connect(uri, { bufferCommands: false })
    await seedAdmin()
  })().catch((err) => {
    cache.ready = null
    throw err
  })
  return cache.ready
}

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@cleancommunity.local').toLowerCase()
  const password = process.env.ADMIN_PASSWORD ?? 'Admin@123'
  if ((await User.countDocuments({ role: 'ADMIN' })) > 0 || (await User.exists({ email }))) return
  try {
    await User.create({
      _id: await nextId('users'),
      name: 'Admin',
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: 'ADMIN',
    })
  } catch (err) {
    // Another server instance created it first.
    if ((err as { code?: number }).code !== 11000) throw err
  }
}
