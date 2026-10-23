import mongoose from 'mongoose'

const counterSchema = new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } })
const Counter = mongoose.models.Counter ?? mongoose.model('Counter', counterSchema)

/** Sequential numeric ids per collection, so the UI keeps showing CC-0001 style codes. */
export async function nextId(name: string): Promise<number> {
  const doc = await Counter.findOneAndUpdate({ _id: name }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: 'after' })
  return doc.seq
}
