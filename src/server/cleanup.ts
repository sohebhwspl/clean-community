import type { z } from 'zod'
import type { AuthUser } from './auth'
import { todayString } from './dates'
import { ApiError } from './http'
import { nextId } from './ids'
import { CleanupEvent, EventRegistration, User, type CleanupEventDoc, type EventStatus } from './models'
import type { eventSchema } from './schemas'

/** An UPCOMING drive whose date has passed is shown as COMPLETED automatically. */
function effectiveStatus(e: CleanupEventDoc): EventStatus {
  return e.status === 'UPCOMING' && e.eventDate < todayString() ? 'COMPLETED' : (e.status as EventStatus)
}

const rank = (s: EventStatus) => (s === 'UPCOMING' ? 0 : s === 'COMPLETED' ? 1 : 2)

async function toViews(events: CleanupEventDoc[], user: AuthUser | null) {
  const ids = events.map((e) => e._id)
  const counts = new Map(
    (
      await EventRegistration.aggregate<{ _id: number; n: number }>([
        { $match: { eventId: { $in: ids } } },
        { $group: { _id: '$eventId', n: { $sum: 1 } } },
      ])
    ).map((r) => [r._id, r.n]),
  )
  const mine = user
    ? new Set((await EventRegistration.find({ eventId: { $in: ids }, userId: user.id }).select('eventId').lean()).map((r) => r.eventId))
    : new Set<number>()
  return events.map((e) => ({
    id: e._id,
    title: e.title,
    description: e.description,
    date: e.eventDate,
    time: e.startTime,
    location: e.location,
    status: effectiveStatus(e),
    participants: counts.get(e._id) ?? 0,
    registered: mine.has(e._id),
  }))
}

async function findEvent(id: number) {
  const e = await CleanupEvent.findById(id)
  if (!e) throw ApiError.notFound('Cleanup drive')
  return e
}

const one = async (e: CleanupEventDoc, user: AuthUser | null) => (await toViews([e], user))[0]

export async function listEvents(filter: EventStatus | undefined, user: AuthUser | null) {
  const events = await CleanupEvent.find().sort({ eventDate: 1, startTime: 1 }).lean()
  const views = (await toViews(events, user)).filter((v) => !filter || v.status === filter)
  return views.sort(
    (a, b) =>
      rank(a.status) - rank(b.status) ||
      (a.status === 'UPCOMING' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)),
  )
}

export async function getEvent(id: number, user: AuthUser | null) {
  return one((await findEvent(id)).toObject(), user)
}

function apply(e: CleanupEventDoc | InstanceType<typeof CleanupEvent>, req: z.output<typeof eventSchema>) {
  e.title = req.title
  e.description = req.description
  e.eventDate = req.date
  e.startTime = req.time
  e.location = req.location
}

export async function createEvent(req: z.output<typeof eventSchema>, user: AuthUser) {
  if (req.date < todayString()) throw ApiError.badRequest('The date cannot be in the past')
  const e = new CleanupEvent({ _id: await nextId('cleanup_events'), createdBy: user.id })
  apply(e, req)
  await e.save()
  return one(e.toObject(), user)
}

export async function updateEvent(id: number, req: z.output<typeof eventSchema>, user: AuthUser) {
  const e = await findEvent(id)
  apply(e, req)
  if (req.status) e.status = req.status
  await e.save()
  return one(e.toObject(), user)
}

export async function registerForEvent(id: number, user: AuthUser) {
  const e = await findEvent(id)
  if (effectiveStatus(e) !== 'UPCOMING') throw ApiError.conflict('Registration is closed for this drive')
  if (await EventRegistration.exists({ eventId: id, userId: user.id })) throw ApiError.conflict('You are already registered')
  try {
    await EventRegistration.create({ _id: await nextId('event_registrations'), eventId: id, userId: user.id })
  } catch (err) {
    if ((err as { code?: number }).code === 11000) throw ApiError.conflict('You are already registered')
    throw err
  }
  return one(e.toObject(), user)
}

export async function cancelRegistration(id: number, user: AuthUser) {
  const e = await findEvent(id)
  if (effectiveStatus(e) !== 'UPCOMING') throw ApiError.conflict('This drive is no longer open')
  const res = await EventRegistration.deleteOne({ eventId: id, userId: user.id })
  if (res.deletedCount === 0) throw ApiError.notFound('Registration')
  return one(e.toObject(), user)
}

export async function eventRegistrations(id: number) {
  await findEvent(id)
  const regs = await EventRegistration.find({ eventId: id }).sort({ createdAt: 1, _id: 1 }).lean()
  const users = new Map(
    (await User.find({ _id: { $in: regs.map((r) => r.userId) } }).lean()).map((u) => [u._id, u] as const),
  )
  return regs.map((r) => {
    const u = users.get(r.userId)
    return { userId: r.userId, name: u?.name ?? '', email: u?.email ?? '', phone: u?.phone ?? null, registeredAt: r.createdAt }
  })
}
