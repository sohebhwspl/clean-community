'use client'

import { useState } from 'react'
import { Link } from '@/lib/router'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import DriveForm from '@/components/DriveForm'
import { useAuth } from '@/hooks/useAuth'
import { getRegistrations, joinDrive, leaveDrive, updateDrive, type DrivePayload } from '@/services/driveService'
import type { EventStatus, EventView, RegistrationView } from '@/types'
import { getErrorMessage } from '@/utils/errors'
import { formatDate, formatTime, titleCase } from '@/utils/format'

const statusColor: Record<EventStatus, string> = {
  UPCOMING: 'bg-emerald-100 text-emerald-800',
  COMPLETED: 'bg-slate-100 text-slate-700',
  CANCELLED: 'bg-red-100 text-red-800',
}

interface Props {
  drive: EventView
  onChanged: () => void
}

export default function DriveItem({ drive, onChanged }: Props) {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [people, setPeople] = useState<RegistrationView[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const isAdmin = user?.role === 'ADMIN'
  const open = drive.status === 'UPCOMING'

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true)
    setError('')
    try {
      await action()
      onChanged()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const base: DrivePayload = {
    title: drive.title,
    description: drive.description,
    date: drive.date,
    time: drive.time.slice(0, 5),
    location: drive.location,
  }

  if (editing) {
    return (
      <DriveForm
        initial={base}
        submitLabel="Save changes"
        onCancel={() => setEditing(false)}
        onSubmit={async (values) => {
          await updateDrive(drive.id, values)
          setEditing(false)
          onChanged()
        }}
      />
    )
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="break-words text-lg font-semibold">{drive.title}</h3>
          <Badge variant="outline" className={`shrink-0 border-transparent ${statusColor[drive.status]}`}>
            {titleCase(drive.status)}
          </Badge>
        </div>
        <p className="whitespace-pre-line break-words text-sm text-muted-foreground">{drive.description}</p>
        <div className="grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="flex items-center gap-2"><Calendar className="size-4" /> {formatDate(drive.date)}</div>
          <div className="flex items-center gap-2"><Clock className="size-4" /> {formatTime(drive.time)}</div>
          <div className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0" /> <span className="break-words">{drive.location}</span></div>
          <div className="flex items-center gap-2"><Users className="size-4" /> {drive.participants} participant{drive.participants === 1 ? '' : 's'}</div>
        </div>

        <div className="flex flex-wrap gap-2">
          {open && !user && (
            <Link to="/login" className="text-sm font-medium text-primary hover:underline">Login to join</Link>
          )}
          {open && user && (drive.registered ? (
            <Button variant="outline" size="sm" disabled={busy} onClick={() => run(() => leaveDrive(drive.id))}>
              Cancel my registration
            </Button>
          ) : (
            <Button size="sm" disabled={busy} onClick={() => run(() => joinDrive(drive.id))}>Join this drive</Button>
          ))}
          {drive.registered && <span className="self-center text-xs font-medium text-primary">You are registered</span>}

          {isAdmin && (
            <>
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Edit</Button>
              {open && (
                <>
                  <Button size="sm" variant="outline" disabled={busy}
                    onClick={() => run(() => updateDrive(drive.id, { ...base, status: 'COMPLETED' }))}>
                    Mark completed
                  </Button>
                  <Button size="sm" variant="outline" disabled={busy}
                    onClick={() => run(() => updateDrive(drive.id, { ...base, status: 'CANCELLED' }))}>
                    Cancel drive
                  </Button>
                </>
              )}
              <Button size="sm" variant="ghost"
                onClick={() => (people ? setPeople(null) : getRegistrations(drive.id).then(setPeople).catch((e) => setError(getErrorMessage(e))))}>
                {people ? 'Hide participants' : 'View participants'}
              </Button>
            </>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {people && (
          <div className="rounded-lg bg-muted/60 p-3 text-sm">
            {people.length === 0 ? (
              <p className="text-muted-foreground">No one has registered yet.</p>
            ) : (
              <ul className="space-y-1">
                {people.map((p) => (
                  <li key={p.userId} className="break-words">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground"> &middot; {p.email}{p.phone ? ` · ${p.phone}` : ''}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}