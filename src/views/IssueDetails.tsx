'use client'

import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from '@/lib/router'
import { ArrowLeft, Calendar, MapPin, User as UserIcon, Wrench } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import StatusBadge from '@/components/StatusBadge'
import ImageGallery from '@/components/ImageGallery'
import Timeline from '@/components/Timeline'
import AdminIssueActions from '@/components/AdminIssueActions'
import LinkButton from '@/components/LinkButton'
import { useAuth } from '@/hooks/useAuth'
import { deleteImage, getHistory, getIssue } from '@/services/issueService'
import type { HistoryEntry, ImageInfo, IssueDetail } from '@/types'
import { getErrorMessage } from '@/utils/errors'
import { formatDate, issueCode, titleCase } from '@/utils/format'

export default function IssueDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [issue, setIssue] = useState<IssueDetail | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [error, setError] = useState('')

  const load = useCallback(() => {
    const issueId = Number(id)
    Promise.all([getIssue(issueId), getHistory(issueId)])
      .then(([i, h]) => {
        setIssue(i)
        setHistory(h)
      })
      .catch((err) => setError(getErrorMessage(err, 'Issue not found.')))
  }, [id])

  useEffect(load, [load])

  if (error && !issue) return <p className="py-24 text-center text-destructive">{error}</p>
  if (!issue) return <p className="py-24 text-center text-muted-foreground">Loading…</p>

  const isAdmin = user?.role === 'ADMIN'
  const canDelete = (img: ImageInfo) => isAdmin || (user?.id === issue.reporter.id && img.type === 'BEFORE')

  const remove = async (img: ImageInfo) => {
    try {
      await deleteImage(issue.id, img.id)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <Link to="/issues" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="size-4" /> Back to issues
      </Link>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      <div className="mt-4 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardContent className="space-y-3 p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">{issueCode(issue.id)}</span>
                <StatusBadge status={issue.status} />
                <Badge variant="outline">{titleCase(issue.priority)} priority</Badge>
                {!issue.active && <Badge variant="outline" className="border-transparent bg-gray-200 text-gray-700">Inactive</Badge>}
              </div>
              <h1 className="break-words text-xl font-bold sm:text-2xl">{issue.title}</h1>
              <p className="text-sm text-primary">{titleCase(issue.category)}</p>
              <p className="whitespace-pre-line break-words text-muted-foreground">{issue.description}</p>
              {issue.statusReason && (
                <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">Reason: {issue.statusReason}</p>
              )}
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  <span className="break-words">{issue.location}{issue.landmark ? ` (near ${issue.landmark})` : ''}</span>
                </div>
                <div className="flex items-center gap-2"><Calendar className="size-4" /> Reported {formatDate(issue.createdAt)}</div>
                <div className="flex items-center gap-2"><UserIcon className="size-4" /> By {issue.reporter.name}</div>
                <div className="flex items-center gap-2">
                  <Wrench className="size-4" /> Volunteer: {issue.assignedVolunteer?.name ?? 'Not assigned yet'}
                </div>
              </div>
              {user?.role === 'VOLUNTEER' && issue.assignedVolunteer?.id === user.id && (
                <LinkButton to="/dashboard" size="sm">Go to my tasks</LinkButton>
              )}
            </CardContent>
          </Card>

          <ImageGallery images={issue.images} canDelete={canDelete} onDelete={remove} />
        </div>

        <div className="min-w-0 space-y-6">
          {isAdmin && <AdminIssueActions issue={issue} onChanged={load} />}
          <Timeline history={history} />
        </div>
      </div>
    </div>
  )
}