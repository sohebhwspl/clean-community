'use client'

import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from '@/lib/router'
import { ArrowLeft, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import StatusBadge from '@/components/StatusBadge'
import ImageGallery from '@/components/ImageGallery'
import ImagePicker from '@/components/ImagePicker'
import NativeSelect from '@/components/NativeSelect'
import Timeline from '@/components/Timeline'
import { getHistory, getIssue } from '@/services/issueService'
import { addProgress, getTask, updateTaskStatus } from '@/services/volunteerService'
import type { HistoryEntry, ImageType, IssueDetail, TaskView } from '@/types'
import { getErrorMessage } from '@/utils/errors'
import { issueCode, titleCase } from '@/utils/format'

export default function TaskDetails() {
  const { id } = useParams()
  const [task, setTask] = useState<TaskView | null>(null)
  const [issue, setIssue] = useState<IssueDetail | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [note, setNote] = useState('')
  const [type, setType] = useState<ImageType>('PROGRESS')
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const t = await getTask(Number(id))
      const [i, h] = await Promise.all([getIssue(t.issueId), getHistory(t.issueId)])
      setTask(t)
      setIssue(i)
      setHistory(h)
    } catch (err) {
      setError(getErrorMessage(err, 'Task not found.'))
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true)
    setMessage('')
    try {
      await action()
      setNote('')
      setFiles([])
      await load()
      setMessage(success)
    } catch (err) {
      setMessage(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (error) return <p className="py-24 text-center text-destructive">{error}</p>
  if (!task || !issue) return <p className="py-24 text-center text-muted-foreground">Loading…</p>

  const started = task.issueStatus === 'IN_PROGRESS'
  const submitted = started && task.completedAt !== null

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="size-4" /> Back to my tasks
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardContent className="space-y-3 p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">{issueCode(task.issueId)}</span>
                <StatusBadge status={task.issueStatus} />
                <Badge variant="outline">{titleCase(task.priority)} priority</Badge>
              </div>
              <h1 className="break-words text-xl font-bold sm:text-2xl">{task.title}</h1>
              <p className="whitespace-pre-line break-words text-muted-foreground">{task.description}</p>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span className="break-words">{task.location}{task.landmark ? ` (near ${task.landmark})` : ''}</span>
              </div>
              {task.adminNotes && (
                <p className="rounded-md bg-secondary p-3 text-sm">Admin instructions: {task.adminNotes}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardContent className="space-y-4 p-4 sm:p-6">
              <h2 className="font-semibold text-primary">Your Work</h2>

              {task.issueStatus === 'ASSIGNED' && (
                <>
                  <p className="text-sm text-muted-foreground">When you reach the location, start the task.</p>
                  <Textarea rows={2} placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
                  <Button disabled={busy} onClick={() => run(() => updateTaskStatus(task.id, 'START', note), 'Work started.')}>
                    Start Work
                  </Button>
                </>
              )}

              {started && !submitted && (
                <>
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Add progress or completion photos</h3>
                    <NativeSelect value={type} onChange={(e) => setType(e.target.value as ImageType)}>
                      <option value="PROGRESS">Progress photo</option>
                      <option value="AFTER">Completion (after) photo</option>
                    </NativeSelect>
                    <ImagePicker files={files} onChange={setFiles} />
                    <Textarea rows={2} placeholder="Work note" value={note} onChange={(e) => setNote(e.target.value)} />
                    <Button
                      variant="outline"
                      disabled={busy || (files.length === 0 && !note.trim())}
                      onClick={() => run(() => addProgress(task.id, note, type, files), 'Update saved.')}
                    >
                      Save Update
                    </Button>
                  </div>
                  <div className="space-y-2 border-t pt-4">
                    <h3 className="text-sm font-semibold">Finished cleaning?</h3>
                    <p className="text-xs text-muted-foreground">Upload at least one completion (after) photo first.</p>
                    <Button disabled={busy} onClick={() => run(() => updateTaskStatus(task.id, 'COMPLETE', note), 'Submitted for verification.')}>
                      Mark Work Complete
                    </Button>
                  </div>
                </>
              )}

              {submitted && (
                <p className="text-sm text-muted-foreground">Your work has been submitted. Waiting for the admin to verify it.</p>
              )}
              {task.issueStatus === 'RESOLVED' && <p className="text-sm text-primary">This issue is resolved. Thank you!</p>}
              {message && <p className="text-sm text-primary">{message}</p>}
            </CardContent>
          </Card>

          <ImageGallery images={issue.images} />
        </div>

        <div className="min-w-0">
          <Timeline history={history} />
        </div>
      </div>
    </div>
  )
}