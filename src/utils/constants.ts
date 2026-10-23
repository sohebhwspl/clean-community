import type { IssueCategory, IssuePriority, IssueStatus } from '@/types'

export const CATEGORIES: IssueCategory[] = [
  'GARBAGE_DUMPING',
  'OVERFLOWING_DUSTBIN',
  'DIRTY_PUBLIC_AREA',
  'DRAINAGE_WASTE',
  'OTHER',
]

export const PRIORITIES: IssuePriority[] = ['LOW', 'MEDIUM', 'HIGH']

export const STATUSES: IssueStatus[] = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED',
  'DUPLICATE',
]

export const MAX_IMAGES = 5
export const MAX_IMAGE_MB = 5
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
