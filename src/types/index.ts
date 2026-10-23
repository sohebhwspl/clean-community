export interface HomeStats {
  totalReports: number
  resolvedIssues: number
  activeVolunteers: number
  cleanupDrives: number
}

export type IssueStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED'
  | 'DUPLICATE'

export type IssueCategory =
  | 'GARBAGE_DUMPING'
  | 'OVERFLOWING_DUSTBIN'
  | 'DIRTY_PUBLIC_AREA'
  | 'DRAINAGE_WASTE'
  | 'OTHER'

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH'
export type ImageType = 'BEFORE' | 'PROGRESS' | 'AFTER'
export type Role = 'RESIDENT' | 'VOLUNTEER' | 'ADMIN'

export interface RecentIssue {
  id: number
  title: string
  category: string
  location: string
  status: IssueStatus
  coverImageId: number | null
  createdAt: string
}

export interface UpcomingDrive {
  id: number
  title: string
  date: string
  time: string
  location: string
  participants: number
}

export interface HomeData {
  stats: HomeStats
  recentIssues: RecentIssue[]
  upcomingDrives: UpcomingDrive[]
}

export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  role: Role
  enabled: boolean
  createdAt: string
}

export interface IssueSummary extends RecentIssue {
  landmark: string | null
  priority: IssuePriority
}

export interface PersonRef {
  id: number
  name: string
}

export interface ImageInfo {
  id: number
  type: ImageType
  createdAt: string
  uploadedBy: string
}

export interface IssueDetail {
  id: number
  title: string
  category: IssueCategory
  description: string
  location: string
  landmark: string | null
  priority: IssuePriority
  status: IssueStatus
  statusReason: string | null
  reporter: PersonRef
  assignedVolunteer: PersonRef | null
  workSubmitted: boolean
  images: ImageInfo[]
  createdAt: string
  updatedAt: string
}

export interface HistoryEntry {
  id: number
  fromStatus: IssueStatus | null
  toStatus: IssueStatus
  changedBy: string
  note: string | null
  createdAt: string
}

export interface DashboardData {
  totalIssues: number
  issuesByStatus: Record<IssueStatus, number>
  awaitingReview: number
  awaitingVerification: number
  usersByRole: Record<Role, number>
  upcomingDrives: number
}

export interface TaskView {
  id: number
  issueId: number
  title: string
  category: IssueCategory
  description: string
  location: string
  landmark: string | null
  priority: IssuePriority
  issueStatus: IssueStatus
  adminNotes: string | null
  coverImageId: number | null
  assignedAt: string
  startedAt: string | null
  completedAt: string | null
}

export type EventStatus = 'UPCOMING' | 'COMPLETED' | 'CANCELLED'

export interface EventView {
  id: number
  title: string
  description: string
  date: string
  time: string
  location: string
  status: EventStatus
  participants: number
  registered: boolean
}

export interface RegistrationView {
  userId: number
  name: string
  email: string
  phone: string | null
  registeredAt: string
}

export interface PageData<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
