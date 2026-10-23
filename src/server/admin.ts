import type { z } from 'zod'
import type { AuthUser } from './auth'
import { ApiError } from './http'
import { nextId } from './ids'
import { ACTIVE_ONLY, findIssue, getIssueDetail, recordHistory, touch } from './issues'
import { CleanupEvent, Issue, STATUSES, ROLES, User, WorkAssignment, type IssueStatus, type Role } from './models'
import type { assignSchema, reviewSchema, userUpdateSchema, verifySchema } from './schemas'
import { toUser } from './accounts'
import { todayString } from './dates'

async function setStatus(id: number, from: IssueStatus, to: IssueStatus, by: number, note: string, reason: string | null) {
  await Issue.updateOne({ _id: id }, { status: to, statusReason: reason })
  await recordHistory(id, from, to, by, note)
}

export async function dashboard() {
  const issuesByStatus = Object.fromEntries(
    await Promise.all(STATUSES.map(async (s) => [s, await Issue.countDocuments({ status: s, ...ACTIVE_ONLY })] as const)),
  )
  const usersByRole = Object.fromEntries(
    await Promise.all(ROLES.map(async (r) => [r, await User.countDocuments({ role: r })] as const)),
  )
  const submittedIds = await WorkAssignment.find({ completedAt: { $ne: null } }).distinct('issueId')
  return {
    totalIssues: await Issue.countDocuments(ACTIVE_ONLY),
    issuesByStatus,
    awaitingReview: issuesByStatus.SUBMITTED,
    awaitingVerification: await Issue.countDocuments({ _id: { $in: submittedIds }, status: 'IN_PROGRESS', ...ACTIVE_ONLY }),
    usersByRole,
    upcomingDrives: await CleanupEvent.countDocuments({ status: 'UPCOMING', eventDate: { $gte: todayString() } }),
  }
}

export async function reviewIssue(id: number, req: z.output<typeof reviewSchema>, admin: AuthUser) {
  if (!req.decision && !req.priority) throw ApiError.badRequest('Nothing to update')
  const issue = await findIssue(id)

  if (req.priority) await Issue.updateOne({ _id: id }, { priority: req.priority })

  if (req.decision) {
    const from = issue.status
    const reason = req.reason?.trim() ?? ''
    if (req.decision === 'APPROVE') {
      if (from !== 'SUBMITTED') throw ApiError.conflict('Only submitted reports can be approved')
      await setStatus(id, from, 'UNDER_REVIEW', admin.id, 'Report approved for review', null)
    } else {
      if (from !== 'SUBMITTED' && from !== 'UNDER_REVIEW') throw ApiError.conflict('This report can no longer be rejected')
      if (!reason) throw ApiError.badRequest('A reason is required')
      await setStatus(id, from, req.decision === 'REJECT' ? 'REJECTED' : 'DUPLICATE', admin.id, reason, reason)
    }
  }
  await touch(id)
  return getIssueDetail(id)
}

export async function assignIssue(id: number, req: z.output<typeof assignSchema>, admin: AuthUser) {
  const issue = await findIssue(id)
  if (issue.status !== 'UNDER_REVIEW' && issue.status !== 'ASSIGNED') {
    throw ApiError.conflict('Approve the report before assigning a volunteer (work may not have started)')
  }
  const volunteer = await User.findById(req.volunteerId).lean()
  if (!volunteer) throw ApiError.notFound('Volunteer')
  if (volunteer.role !== 'VOLUNTEER' || !volunteer.enabled) {
    throw ApiError.badRequest('Selected user is not an active volunteer')
  }
  const reassign = issue.status === 'ASSIGNED'

  await WorkAssignment.deleteMany({ issueId: id })
  await WorkAssignment.create({
    _id: await nextId('work_assignments'),
    issueId: id,
    volunteerId: volunteer._id,
    assignedBy: admin.id,
    notes: req.notes?.trim() || null,
  })
  await setStatus(id, issue.status, 'ASSIGNED', admin.id, `${reassign ? 'Reassigned to' : 'Assigned to'} ${volunteer.name}`, null)
  await touch(id)
  return getIssueDetail(id)
}

export async function verifyResolution(id: number, req: z.output<typeof verifySchema>, admin: AuthUser) {
  const issue = await findIssue(id)
  const a = await WorkAssignment.findOne({ issueId: id }).sort({ assignedAt: -1, _id: -1 })
  if (issue.status !== 'IN_PROGRESS' || !a || !a.completedAt) {
    throw ApiError.conflict('The volunteer has not submitted the work for verification')
  }
  const note = req.note?.trim() ?? ''
  if (req.approved) {
    await setStatus(id, issue.status, 'RESOLVED', admin.id, note || 'Cleanup verified and resolved', null)
  } else {
    if (!note) throw ApiError.badRequest('Tell the volunteer what needs to be fixed')
    a.completedAt = null
    await a.save()
    await setStatus(id, issue.status, 'IN_PROGRESS', admin.id, `Sent back for more work: ${note}`, null)
  }
  await touch(id)
  return getIssueDetail(id)
}

/** Soft delete: hide an issue everywhere (or bring it back). Nothing is removed from the database. */
export async function setIssueActive(id: number, active: boolean) {
  await findIssue(id)
  await Issue.updateOne({ _id: id }, { active, updatedAt: new Date() })
  return getIssueDetail(id, { id: 0, email: '', role: 'ADMIN' })
}

export async function listUsers(role?: Role) {
  const users = role ? await User.find({ role }).sort({ name: 1 }).lean() : await User.find().sort({ createdAt: -1 }).lean()
  return users.map(toUser)
}

export async function updateUser(id: number, req: z.output<typeof userUpdateSchema>, admin: AuthUser) {
  const u = await User.findById(id)
  if (!u) throw ApiError.notFound('User')
  if (u._id === admin.id) throw ApiError.badRequest('You cannot change your own role or status')
  if (req.role) u.role = req.role
  if (req.enabled !== null && req.enabled !== undefined) u.enabled = req.enabled
  await u.save()
  return toUser(u.toObject())
}
