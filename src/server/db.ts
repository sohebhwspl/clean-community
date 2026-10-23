import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { nextId } from './ids'
import { User } from './models'

const globalCache = globalThis as unknown as {
  __ccMongo?: { conn: Promise<typeof mongoose> | null; seeded: boolean }
}
const cache = (globalCache.__ccMongo ??= { conn: null, seeded: false })

/** Connects once per server instance and makes sure the first admin account exists. */
export async function connectDb() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set')

  cache.conn ??= mongoose.connect(uri, { bufferCommands: false }).catch((err) => {
    cache.conn = null
    throw err
  })
  await cache.conn
  if (!cache.seeded) {
    await seedAdmin()
    cache.seeded = true
  }
}

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@cleancommunity.local').toLowerCase()
  const password = process.env.ADMIN_PASSWORD ?? 'Admin@123'
  if ((await User.countDocuments({ role: 'ADMIN' })) > 0 || (await User.exists({ email }))) return
  await User.create({
    _id: await nextId('users'),
    name: 'Admin',
    email,
    passwordHash: await bcrypt.hash(password, 10),
    role: 'ADMIN',
  })
}
