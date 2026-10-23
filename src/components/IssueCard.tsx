'use client'

import { Link } from '@/lib/router'
import { Calendar, ImageOff, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import StatusBadge from '@/components/StatusBadge'
import type { RecentIssue } from '@/types'
import { formatDate, issueCode, titleCase } from '@/utils/format'

export default function IssueCard({ issue }: { issue: RecentIssue }) {
  return (
    <Link to={`/issues/${issue.id}`}>
      <Card className="overflow-hidden py-0 transition-shadow hover:shadow-md">
        <div className="flex h-40 items-center justify-center bg-secondary">
          {issue.coverImageId ? (
            <img src={`/api/files/${issue.coverImageId}`} alt={issue.title} className="h-full w-full object-cover" />
          ) : (
            <ImageOff className="size-8 text-primary/40" />
          )}
        </div>
        <CardContent className="space-y-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">{issueCode(issue.id)}</span>
            <StatusBadge status={issue.status} />
          </div>
          <h3 className="line-clamp-1 font-semibold">{issue.title}</h3>
          <p className="text-xs text-primary">{titleCase(issue.category)}</p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            <span className="line-clamp-1">{issue.location}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="size-3.5" />
            {formatDate(issue.createdAt)}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}