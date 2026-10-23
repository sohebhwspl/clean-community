'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import DriveForm from '@/components/DriveForm'
import DriveItem from '@/components/DriveItem'
import { useAuth } from '@/hooks/useAuth'
import { createDrive, getDrives } from '@/services/driveService'
import type { EventStatus, EventView } from '@/types'

const tabs: { value: EventStatus; label: string }[] = [
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export default function Drives() {
  const { user, loading: authLoading } = useAuth()
  const [tab, setTab] = useState<EventStatus>('UPCOMING')
  const [drives, setDrives] = useState<EventView[] | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    getDrives(tab)
      .then((d) => {
        setDrives(d)
        setError('')
      })
      .catch(() => setError('Could not load cleanup drives. Is the backend running?'))
  }, [tab])

  useEffect(() => {
    if (!authLoading) load()
  }, [load, authLoading, user?.id])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-primary">Cleanup Drives</h1>
        {user?.role === 'ADMIN' && !creating && <Button size="sm" onClick={() => setCreating(true)}>New Drive</Button>}
      </div>

      {creating && (
        <div className="mt-4">
          <DriveForm
            submitLabel="Create drive"
            onCancel={() => setCreating(false)}
            onSubmit={async (values) => {
              await createDrive(values)
              setCreating(false)
              setTab('UPCOMING')
              load()
            }}
          />
        </div>
      )}

      <div className="mt-5 flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <Button key={t.value} size="sm" variant={tab === t.value ? 'default' : 'outline'} onClick={() => { setDrives(null); setTab(t.value) }}>
            {t.label}
          </Button>
        ))}
      </div>

      {error && <p className="mt-6 text-destructive">{error}</p>}
      {!drives && !error && <p className="mt-6 text-muted-foreground">Loading…</p>}
      {drives && drives.length === 0 && (
        <p className="mt-6 rounded-lg border bg-white p-8 text-center text-muted-foreground">No {tab.toLowerCase()} drives.</p>
      )}
      <div className="mt-5 space-y-4">
        {drives?.map((d) => <DriveItem key={d.id} drive={d} onChanged={load} />)}
      </div>
    </div>
  )
}