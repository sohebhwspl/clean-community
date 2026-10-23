import mongoose, { Schema } from 'mongoose'

export const ROLES = ['RESIDENT', 'VOLUNTEER', 'ADMIN'] as const
export const CATEGORIES = ['GARBAGE_DUMPING', 'OVERFLOWING_DUSTBIN', 'DIRTY_PUBLIC_AREA', 'DRAINAGE_WASTE', 'OTHER'] as const
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const
export const STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'DUPLICATE'] as const
export const IMAGE_TYPES = ['BEFORE', 'PROGRESS', 'AFTER'] as const
export const EVENT_STATUSES = ['UPCOMING', 'COMPLETED', 'CANCELLED'] as const

export type Role = (typeof ROLES)[number]
export type IssueCategory = (typeof CATEGORIES)[number]
export type IssuePriority = (typeof PRIORITIES)[number]
export type IssueStatus = (typeof STATUSES)[number]
export type ImageType = (typeof IMAGE_TYPES)[number]
export type EventStatus = (typeof EVENT_STATUSES)[number]

const values = (v: readonly string[]) => [...v]

const opts = { _id: false, versionKey: false } as const

const userSchema = new Schema(
  {
    _id: Number,
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, default: null },
    role: { type: String, enum: values(ROLES), default: 'RESIDENT' },
    enabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  opts,
)

const issueSchema = new Schema(
  {
    _id: Number,
    title: { type: String, required: true },
    category: { type: String, enum: values(CATEGORIES), required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    landmark: { type: String, default: null },
    priority: { type: String, enum: values(PRIORITIES), default: 'MEDIUM' },
    status: { type: String, enum: values(STATUSES), default: 'SUBMITTED', index: true },
    statusReason: { type: String, default: null },
    reporterId: { type: Number, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  opts,
)

// Only the S3 object key is stored here; the image bytes live in S3.
const issueImageSchema = new Schema(
  {
    _id: Number,
    issueId: { type: Number, required: true, index: true },
    uploadedBy: { type: Number, required: true },
    imageType: { type: String, enum: values(IMAGE_TYPES), required: true },
    originalName: { type: String, default: null },
    contentType: { type: String, required: true },
    key: { type: String, required: true }, // object key in the S3 bucket
    createdAt: { type: Date, default: Date.now },
  },
  opts,
)

const workAssignmentSchema = new Schema(
  {
    _id: Number,
    issueId: { type: Number, required: true, index: true },
    volunteerId: { type: Number, required: true, index: true },
    assignedBy: { type: Number, required: true },
    notes: { type: String, default: null },
    assignedAt: { type: Date, default: Date.now },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  opts,
)

const issueStatusHistorySchema = new Schema(
  {
    _id: Number,
    issueId: { type: Number, required: true, index: true },
    fromStatus: { type: String, enum: values(STATUSES), default: null },
    toStatus: { type: String, enum: values(STATUSES), required: true },
    changedBy: { type: Number, required: true },
    note: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  opts,
)

const cleanupEventSchema = new Schema(
  {
    _id: Number,
    title: { type: String, required: true },
    description: { type: String, required: true },
    eventDate: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, required: true }, // HH:mm
    location: { type: String, required: true },
    status: { type: String, enum: values(EVENT_STATUSES), default: 'UPCOMING' },
    createdBy: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  opts,
)

const eventRegistrationSchema = new Schema(
  {
    _id: Number,
    eventId: { type: Number, required: true },
    userId: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  opts,
)
eventRegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true })

const passwordResetSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    // MongoDB removes the document automatically once this time passes.
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { versionKey: false },
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function model<T>(name: string, schema: Schema<any>): mongoose.Model<T> {
  return (mongoose.models[name] ?? mongoose.model(name, schema)) as unknown as mongoose.Model<T>
}

export interface UserDoc {
  _id: number
  name: string
  email: string
  passwordHash: string
  phone?: string | null
  role: Role
  enabled: boolean
  createdAt: Date
}
export interface IssueDoc {
  _id: number
  title: string
  category: IssueCategory
  description: string
  location: string
  landmark?: string | null
  priority: IssuePriority
  status: IssueStatus
  statusReason?: string | null
  reporterId: number
  createdAt: Date
  updatedAt: Date
}
export interface IssueImageDoc {
  _id: number
  issueId: number
  uploadedBy: number
  imageType: ImageType
  originalName?: string | null
  contentType: string
  key: string
  createdAt: Date
}
export interface WorkAssignmentDoc {
  _id: number
  issueId: number
  volunteerId: number
  assignedBy: number
  notes?: string | null
  assignedAt: Date
  startedAt?: Date | null
  completedAt?: Date | null
}
export interface HistoryDoc {
  _id: number
  issueId: number
  fromStatus?: IssueStatus | null
  toStatus: IssueStatus
  changedBy: number
  note?: string | null
  createdAt: Date
}
export interface CleanupEventDoc {
  _id: number
  title: string
  description: string
  eventDate: string
  startTime: string
  location: string
  status: EventStatus
  createdBy: number
  createdAt: Date
}
export interface EventRegistrationDoc {
  _id: number
  eventId: number
  userId: number
  createdAt: Date
}

export interface PasswordResetDoc {
  email: string
  otpHash: string
  attempts: number
  createdAt: Date
  expiresAt: Date
}

export const User = model<UserDoc>('User', userSchema)
export const Issue = model<IssueDoc>('Issue', issueSchema)
export const IssueImage = model<IssueImageDoc>('IssueImage', issueImageSchema)
export const WorkAssignment = model<WorkAssignmentDoc>('WorkAssignment', workAssignmentSchema)
export const IssueStatusHistory = model<HistoryDoc>('IssueStatusHistory', issueStatusHistorySchema)
export const CleanupEvent = model<CleanupEventDoc>('CleanupEvent', cleanupEventSchema)
export const EventRegistration = model<EventRegistrationDoc>('EventRegistration', eventRegistrationSchema)
export const PasswordReset = model<PasswordResetDoc>('PasswordReset', passwordResetSchema)
