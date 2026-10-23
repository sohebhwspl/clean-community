'use client'

import { Badge } from '@/components/ui/badge'
import type { IssueStatus } from '@/types'
import { titleCase } from '@/utils/format'

const colors: Record<IssueStatus, string> = {
  SUBMITTED: 'bg-slate-100 text-slate-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-orange-100 text-orange-800',
  RESOLVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
  DUPLICATE: 'bg-purple-100 text-purple-800',
}

export default function StatusBadge({ status }: { status: IssueStatus }) {
  return (
    <Badge variant="outline" className={`border-transparent ${colors[status]}`}>
      {titleCase(status)}
    </Badge>
  )
}