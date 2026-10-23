'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import NativeSelect from '@/components/NativeSelect'
import { assignIssue, getUsers, reviewIssue, setIssueActive, verifyResolution } from '@/services/adminService'
import type { IssueDetail, IssuePriority, User } from '@/types'
import { PRIORITIES } from '@/utils/constants'
import { getErrorMessage } from '@/utils/errors'
import { titleCase } from '@/utils/format'

interface Props {
  issue: IssueDetail
  onChanged: () => void
}

export default function AdminIssueActions({ issue, onChanged }: Props) {
  const [reason, setReason] = useState('')
  const [volunteers, setVolunteers] = useState<User[]>([])
  const [volunteerId, setVolunteerId] = useState('')
  const [notes, setNotes] = useState('')
  const [verifyNote, setVerifyNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const canAssign = issue.status === 'UNDER_REVIEW' || issue.status === 'ASSIGNED'
  const canReview = issue.status === 'SUBMITTED' || issue.status === 'UNDER_REVIEW'
  const canVerify = issue.status === 'IN_PROGRESS' && issue.workSubmitted

  useEffect(() => {
    if (canAssign) getUsers('VOLUNTEER').then(setVolunteers).catch(() => setVolunteers([]))
  }, [canAssign])

  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true)
    setMessage('')
    try {
      await action()
      setReason('')
      setVerifyNote('')
      onChanged()
      setMessage(success)
    } catch (err) {
      setMessage(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const noActions = !canReview && !canAssign && !canVerify

  return (
    <Card className="border-primary/30">
      <CardContent className="space-y-5 p-4 sm:p-6">
        <h2 className="font-semibold text-primary">Admin Actions</h2>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Priority</label>
          <NativeSelect
            value={issue.priority}
            disabled={busy}
            onChange={(e) => run(() => reviewIssue(issue.id, { priority: e.target.value as IssuePriority }), 'Priority updated.')}
          >
            {PRIORITIES.map((p) => <option key={p} value={p}>{titleCase(p)}</option>)}
          </NativeSelect>
        </div>

        {canReview && (
          <div className="space-y-2 border-t pt-4">
            <h3 className="text-sm font-semibold">Review</h3>
            {issue.status === 'SUBMITTED' && (
              <Button disabled={busy} className="w-full" onClick={() => run(() => reviewIssue(issue.id, { decision: 'APPROVE' }), 'Report approved.')}>
                Approve for review
              </Button>
            )}
            <Textarea rows={2} placeholder="Reason (required to reject or mark duplicate)" value={reason} onChange={(e) => setReason(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" disabled={busy} onClick={() => run(() => reviewIssue(issue.id, { decision: 'REJECT', reason }), 'Report rejected.')}>
                Reject
              </Button>
              <Button variant="outline" disabled={busy} onClick={() => run(() => reviewIssue(issue.id, { decision: 'DUPLICATE', reason }), 'Marked as duplicate.')}>
                Duplicate
              </Button>
            </div>
          </div>
        )}

        {canAssign && (
          <div className="space-y-2 border-t pt-4">
            <h3 className="text-sm font-semibold">{issue.status === 'ASSIGNED' ? 'Reassign volunteer' : 'Assign volunteer'}</h3>
            <NativeSelect value={volunteerId} onChange={(e) => setVolunteerId(e.target.value)}>
              <option value="">Select volunteer</option>
              {volunteers.filter((v) => v.enabled !== false).map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </NativeSelect>
            {volunteers.length === 0 && <p className="text-xs text-muted-foreground">No volunteers yet. Promote a user on the Users page.</p>}
            <Input placeholder="Instructions (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button
              className="w-full"
              disabled={busy || !volunteerId}
              onClick={() => run(() => assignIssue(issue.id, Number(volunteerId), notes), 'Volunteer assigned.')}
            >
              Assign
            </Button>
          </div>
        )}

        {canVerify && (
          <div className="space-y-2 border-t pt-4">
            <h3 className="text-sm font-semibold">Verify completed work</h3>
            <p className="text-xs text-muted-foreground">Check the after photos, then resolve or send it back.</p>
            <Textarea rows={2} placeholder="Note (required when sending back)" value={verifyNote} onChange={(e) => setVerifyNote(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Button disabled={busy} onClick={() => run(() => verifyResolution(issue.id, true, verifyNote), 'Issue resolved.')}>
                Resolve
              </Button>
              <Button variant="outline" disabled={busy} onClick={() => run(() => verifyResolution(issue.id, false, verifyNote), 'Sent back to volunteer.')}>
                Send back
              </Button>
            </div>
          </div>
        )}

        {noActions && <p className="text-sm text-muted-foreground">No further actions for this status.</p>}

        <div className="space-y-2 border-t pt-4">
          <h3 className="text-sm font-semibold">Visibility</h3>
          <p className="text-xs text-muted-foreground">
            {issue.active
              ? 'Deactivating hides this report from everyone except admins. Nothing is deleted.'
              : 'This report is inactive and hidden from everyone except admins.'}
          </p>
          <Button
            variant={issue.active ? 'destructive' : 'default'}
            className="w-full"
            disabled={busy}
            onClick={() => {
              if (issue.active && !window.confirm('Deactivate this report? You can activate it again later.')) return
              run(() => setIssueActive(issue.id, !issue.active), issue.active ? 'Report deactivated.' : 'Report activated.')
            }}
          >
            {issue.active ? 'Deactivate report' : 'Activate report'}
          </Button>
        </div>
        {message && <p className="text-sm text-primary">{message}</p>}
      </CardContent>
    </Card>
  )
}