// Usage: node --env-file=.env scripts/reset-admin-password.mjs <admin-email> <new-password>
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

const [email, password] = process.argv.slice(2)
if (!email || !password || password.length < 6 || password.length > 72) {
  console.error('Usage: node --env-file=.env scripts/reset-admin-password.mjs <admin-email> <new-password (6-72 chars)>')
  process.exit(1)
}
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set')
  process.exit(1)
}

await mongoose.connect(process.env.MONGODB_URI)
const res = await mongoose.connection.collection('users').updateOne(
  { email: email.trim().toLowerCase(), role: 'ADMIN' },
  { $set: { passwordHash: await bcrypt.hash(password, 10), enabled: true } },
)
console.log(res.matchedCount ? 'Admin password updated.' : 'No admin account found with that email.')
await mongoose.disconnect()
process.exit(res.matchedCount ? 0 : 1)
