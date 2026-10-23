import type { z } from 'zod'
import type { AuthUser } from './auth'
import { ApiError } from './http'
import { nextId } from './ids'
import {
  Issue,
  IssueImage,
  IssueStatusHistory,
  User,
  WorkAssignment,
  type IssueCategory,
  type IssueDoc,
  type IssuePriority,
  type IssueStatus,
} from './models'
import type { issueSchema } from './schemas'

export interface Page<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export const pageOf = <T>(content: T[], page: number, size: number, total: number): Page<T> => ({
  content,
  page,
  size,
  totalElements: total,
  totalPages: Math.ceil(total / size),
})

export async function userNames(ids: number[]): Promise<Map<number, string>> {
  const users = await User.find({ _id: { $in: [...new Set(ids)] } })
    .select('name')
    .lean()
  return new Map(users.map((u) => [u._id, u.name]))
}

export async function findIssue(id: number) {
  const issue = await Issue.findById(id).lean()
  if (!issue) throw ApiError.notFound('Issue')
  return issue
}

export async function recordHistory(
  issueId: number,
  from: IssueStatus | null,
  to: IssueStatus,
  byUserId: number,
  note: string | null,
) {
  await IssueStatusHistory.create({
    _id: await nextId('issue_status_history'),
    issueId,
    fromStatus: from,
    toStatus: to,
    changedBy: byUserId,
    note,
  })
}

export async function latestAssignment(issueId: number) {
  return WorkAssignment.findOne({ issueId }).sort({ assignedAt: -1, _id: -1 }).lean()
}

/** issueId -> id of its first uploaded image (used as the card cover). */
export async function coverImages(issueIds: number[]): Promise<Map<number, number>> {
  if (issueIds.length === 0) return new Map()
  const rows = await IssueImage.aggregate<{ _id: number; first: number }>([
    { $match: { issueId: { $in: issueIds } } },
    { $project: { issueId: 1 } },
    { $sort: { _id: 1 } },
    { $group: { _id: '$issueId', first: { $first: '$_id' } } },
  ])
  return new Map(rows.map((r) => [r._id, r.first]))
}

export async function toSummaries(issues: IssueDoc[]) {
  const covers = await coverImages(issues.map((i) => i._id))
  return issues.map((i) => ({
    id: i._id,
    title: i.title,
    category: i.category,
    location: i.location,
    landmark: i.landmark ?? null,
    priority: i.priority,
    status: i.status,
    coverImageId: covers.get(i._id) ?? null,
    createdAt: i.createdAt,
  }))
}

export async function toDetail(i: IssueDoc) {
  const [assignment, images, reporter] = await Promise.all([
    latestAssignment(i._id),
    IssueImage.find({ issueId: i._id }).select('-key').sort({ createdAt: 1, _id: 1 }).lean(),
    User.findById(i.reporterId).select('name').lean(),
  ])
  const names = await userNames([...images.map((m) => m.uploadedBy), ...(assignment ? [assignment.volunteerId] : [])])
  return {
    id: i._id,
    title: i.title,
    category: i.category,
    description: i.description,
    location: i.location,
    landmark: i.landmark ?? null,
    priority: i.priority,
    status: i.status,
    statusReason: i.statusReason ?? null,
    reporter: { id: i.reporterId, name: reporter?.name ?? '' },
    assignedVolunteer: assignment
      ? { id: assignment.volunteerId, name: names.get(assignment.volunteerId) ?? '' }
      : null,
    workSubmitted: !!assignment?.completedAt,
    images: images.map((m) => ({
      id: m._id,
      type: m.imageType,
      createdAt: m.createdAt,
      uploadedBy: names.get(m.uploadedBy) ?? '',
    })),
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
  }
}

export async function getIssueDetail(id: number) {
  return toDetail(await findIssue(id))
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** "12", "CC-0012" and "#12" all mean issue 12. */
function parseIssueId(q: string): number | null {
  const digits = q.trim().toUpperCase().replace(/^(CC-|#)/, '')
  return /^\d{1,15}$/.test(digits) ? Number(digits) : null
}

function normalisePaging(page: number, size: number) {
  return { page: Math.max(page, 0), size: Math.min(Math.max(size, 1), 50) }
}

export interface IssueFilters {
  q?: string | null
  category?: IssueCategory
  status?: IssueStatus
  priority?: IssuePriority
}

export async function searchIssues(f: IssueFilters, rawPage: number, rawSize: number) {
  const { page, size } = normalisePaging(rawPage, rawSize)
  const filter: Record<string, unknown> = {}
  if (f.q && f.q.trim()) {
    const rx = new RegExp(escapeRegex(f.q.trim()), 'i')
    const or: Record<string, unknown>[] = [{ title: rx }, { location: rx }]
    const id = parseIssueId(f.q)
    if (id !== null) or.push({ _id: id })
    filter.$or = or
  }
  if (f.category) filter.category = f.category
  if (f.status) filter.status = f.status
  if (f.priority) filter.priority = f.priority
  return pagedQuery(filter, page, size)
}

export async function myIssues(user: AuthUser, rawPage: number, rawSize: number) {
  const { page, size } = normalisePaging(rawPage, rawSize)
  return pagedQuery({ reporterId: user.id }, page, size)
}

async function pagedQuery(filter: Record<string, unknown>, page: number, size: number) {
  const [rows, total] = await Promise.all([
    Issue.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(page * size)
      .limit(size)
      .lean(),
    Issue.countDocuments(filter),
  ])
  return pageOf(await toSummaries(rows), page, size, total)
}

type IssueInput = z.output<typeof issueSchema>

export async function createIssue(req: IssueInput, user: AuthUser) {
  const id = await nextId('issues')
  const issue = await Issue.create({
    _id: id,
    title: req.title,
    category: req.category,
    description: req.description,
    location: req.location,
    landmark: req.landmark,
    priority: req.priority ?? 'MEDIUM',
    reporterId: user.id,
  })
  await recordHistory(id, null, 'SUBMITTED', user.id, 'Issue reported')
  return toDetail(issue.toObject())
}

export async function updateIssue(id: number, req: IssueInput, user: AuthUser) {
  const issue = await findIssue(id)
  const owner = issue.reporterId === user.id
  const admin = user.role === 'ADMIN'
  if (!owner && !admin) throw ApiError.forbidden('You can only edit your own reports')
  if (!admin && issue.status !== 'SUBMITTED') throw ApiError.conflict('A report can only be edited before it is reviewed')
  const updated = await Issue.findByIdAndUpdate(
    id,
    {
      title: req.title,
      category: req.category,
      description: req.description,
      location: req.location,
      landmark: req.landmark,
      priority: req.priority ?? 'MEDIUM',
      updatedAt: new Date(),
    },
    { new: true },
  ).lean()
  return toDetail(updated!)
}

export async function issueHistory(id: number) {
  await findIssue(id)
  const rows = await IssueStatusHistory.find({ issueId: id }).sort({ createdAt: 1, _id: 1 }).lean()
  const names = await userNames(rows.map((h) => h.changedBy))
  return rows.map((h) => ({
    id: h._id,
    fromStatus: h.fromStatus ?? null,
    toStatus: h.toStatus,
    changedBy: names.get(h.changedBy) ?? '',
    note: h.note ?? null,
    createdAt: h.createdAt,
  }))
}

export async function touch(id: number) {
  await Issue.updateOne({ _id: id }, { updatedAt: new Date() })
}
