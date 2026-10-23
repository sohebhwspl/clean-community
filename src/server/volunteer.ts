import type { z } from 'zod'
import type { AuthUser } from './auth'
import { ApiError } from './http'
import { uploadImages } from './images'
import { coverImages, recordHistory, touch } from './issues'
import { Issue, IssueImage, WorkAssignment, type ImageType, type IssueDoc, type WorkAssignmentDoc } from './models'
import type { taskStatusSchema } from './schemas'

async function toViews(assignments: WorkAssignmentDoc[], issues?: Map<number, IssueDoc>) {
  const ids = assignments.map((a) => a.issueId)
  const issueMap =
    issues ?? new Map((await Issue.find({ _id: { $in: ids } }).lean()).map((i) => [i._id, i] as const))
  const covers = await coverImages(ids)
  return assignments.map((a) => {
    const i = issueMap.get(a.issueId)!
    return {
      id: a._id,
      issueId: i._id,
      title: i.title,
      category: i.category,
      description: i.description,
      location: i.location,
      landmark: i.landmark ?? null,
      priority: i.priority,
      issueStatus: i.status,
      adminNotes: a.notes ?? null,
      coverImageId: covers.get(i._id) ?? null,
      assignedAt: a.assignedAt,
      startedAt: a.startedAt ?? null,
      completedAt: a.completedAt ?? null,
    }
  })
}

async function ownTask(taskId: number, user: AuthUser) {
  const a = await WorkAssignment.findById(taskId)
  if (!a) throw ApiError.notFound('Task')
  if (a.volunteerId !== user.id) throw ApiError.forbidden('This task is not assigned to you')
  return a
}

async function viewOf(a: WorkAssignmentDoc) {
  return (await toViews([a]))[0]
}

export async function listTasks(user: AuthUser, completed: boolean) {
  const assignments = await WorkAssignment.find({ volunteerId: user.id }).sort({ assignedAt: -1, _id: -1 }).lean()
  const issues = new Map(
    (await Issue.find({ _id: { $in: assignments.map((a) => a.issueId) } }).lean()).map((i) => [i._id, i] as const),
  )
  const mine = assignments.filter((a) => (issues.get(a.issueId)?.status === 'RESOLVED') === completed)
  return toViews(mine, issues)
}

export async function getTask(taskId: number, user: AuthUser) {
  return viewOf((await ownTask(taskId, user)).toObject())
}

export async function updateTaskStatus(taskId: number, req: z.output<typeof taskStatusSchema>, user: AuthUser) {
  const a = await ownTask(taskId, user)
  const issue = (await Issue.findById(a.issueId).lean())!
  const note = req.note?.trim() ?? ''

  if (req.action === 'START') {
    if (issue.status !== 'ASSIGNED') throw ApiError.conflict('This task cannot be started')
    a.startedAt = new Date()
    await a.save()
    await Issue.updateOne({ _id: issue._id }, { status: 'IN_PROGRESS' })
    await recordHistory(issue._id, 'ASSIGNED', 'IN_PROGRESS', user.id, note || 'Volunteer started work')
  } else {
    if (issue.status !== 'IN_PROGRESS' || a.completedAt) throw ApiError.conflict('This task is not in progress')
    if (!(await IssueImage.exists({ issueId: issue._id, imageType: 'AFTER' }))) {
      throw ApiError.badRequest('Upload at least one completion (AFTER) photo first')
    }
    a.completedAt = new Date()
    await a.save()
    await recordHistory(
      issue._id,
      'IN_PROGRESS',
      'IN_PROGRESS',
      user.id,
      `Work submitted for verification${note ? `: ${note}` : ''}`,
    )
  }
  await touch(issue._id)
  return viewOf(a.toObject())
}

export async function addProgress(taskId: number, note: string | null, type: ImageType, files: File[], user: AuthUser) {
  const a = await ownTask(taskId, user)
  const issue = (await Issue.findById(a.issueId).lean())!
  if (issue.status !== 'IN_PROGRESS' || a.completedAt) {
    throw ApiError.conflict('Progress can only be added while the work is in progress')
  }
  if (type === 'BEFORE') throw ApiError.badRequest('Use PROGRESS or AFTER for volunteer photos')
  const hasNote = !!note && note.trim().length > 0
  if (files.length === 0 && !hasNote) throw ApiError.badRequest('Add a note or at least one photo')

  if (files.length > 0) await uploadImages(issue._id, type, files, user)
  const text = hasNote
    ? `Work note: ${note!.trim()}`
    : type === 'AFTER'
      ? 'Completion photos added'
      : 'Progress photos added'
  await recordHistory(issue._id, 'IN_PROGRESS', 'IN_PROGRESS', user.id, text)
  await touch(issue._id)
  return viewOf(a.toObject())
}
