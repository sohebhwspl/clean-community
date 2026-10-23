import { todayString } from './dates'
import { coverImages } from './issues'
import { CleanupEvent, EventRegistration, Issue, User } from './models'

export async function loadHome() {
  const today = todayString()
  const [totalReports, resolvedIssues, activeVolunteers, cleanupDrives, recent, drives] = await Promise.all([
    Issue.countDocuments(),
    Issue.countDocuments({ status: 'RESOLVED' }),
    User.countDocuments({ role: 'VOLUNTEER' }),
    CleanupEvent.countDocuments({ status: { $ne: 'CANCELLED' } }),
    Issue.find().sort({ createdAt: -1, _id: -1 }).limit(6).lean(),
    CleanupEvent.find({ status: 'UPCOMING', eventDate: { $gte: today } })
      .sort({ eventDate: 1, startTime: 1 })
      .limit(3)
      .lean(),
  ])

  const covers = await coverImages(recent.map((i) => i._id))
  const counts = new Map(
    (
      await EventRegistration.aggregate<{ _id: number; n: number }>([
        { $match: { eventId: { $in: drives.map((d) => d._id) } } },
        { $group: { _id: '$eventId', n: { $sum: 1 } } },
      ])
    ).map((r) => [r._id, r.n]),
  )

  return {
    stats: { totalReports, resolvedIssues, activeVolunteers, cleanupDrives },
    recentIssues: recent.map((i) => ({
      id: i._id,
      title: i.title,
      category: i.category,
      location: i.location,
      status: i.status,
      coverImageId: covers.get(i._id) ?? null,
      createdAt: i.createdAt,
    })),
    upcomingDrives: drives.map((d) => ({
      id: d._id,
      title: d.title,
      date: d.eventDate,
      time: d.startTime,
      location: d.location,
      participants: counts.get(d._id) ?? 0,
    })),
  }
}
