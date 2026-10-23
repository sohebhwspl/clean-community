'use client'

import { useEffect, useState } from 'react'
import { Link } from '@/lib/router'
import { Calendar, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import StatusBadge from '@/components/StatusBadge'
import { getTasks } from '@/services/volunteerService'
import type { TaskView } from '@/types'
import { formatDate, issueCode, titleCase } from '@/utils/format'

export default function VolunteerDashboard() {
  const [completed, setCompleted] = useState(false)
  const [tasks, setTasks] = useState<TaskView[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setTasks(null)
    getTasks(completed)
      .then(setTasks)
      .catch(() => setError('Could not load your tasks.'))
  }, [completed])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-primary">My Tasks</h1>
      <div className="mt-4 flex gap-2">
        <Button size="sm" variant={completed ? 'outline' : 'default'} onClick={() => setCompleted(false)}>Active</Button>
        <Button size="sm" variant={completed ? 'default' : 'outline'} onClick={() => setCompleted(true)}>Completed</Button>
      </div>

      {error && <p className="mt-6 text-destructive">{error}</p>}
      {!tasks && !error && <p className="mt-6 text-muted-foreground">Loading…</p>}
      {tasks && tasks.length === 0 && (
        <p className="mt-6 rounded-lg border bg-white p-8 text-center text-muted-foreground">
          {completed ? 'No completed tasks yet.' : 'No active tasks. An admin will assign you when something needs cleaning.'}
        </p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tasks?.map((t) => (
          <Link key={t.id} to={`/tasks/${t.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">{issueCode(t.issueId)}</span>
                  <StatusBadge status={t.issueStatus} />
                </div>
                <h3 className="line-clamp-2 font-semibold">{t.title}</h3>
                <div className="flex items-start gap-1 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0" /> <span className="line-clamp-2">{t.location}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{titleCase(t.priority)} priority</Badge>
                  <span className="flex items-center gap-1"><Calendar className="size-3.5" /> {formatDate(t.assignedAt)}</span>
                </div>
                {t.completedAt && t.issueStatus === 'IN_PROGRESS' && (
                  <p className="text-xs text-amber-700">Waiting for admin verification</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}