'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import NativeSelect from '@/components/NativeSelect'
import { useAuth } from '@/hooks/useAuth'
import { getUsers, updateUser } from '@/services/adminService'
import type { Role, User } from '@/types'
import { getErrorMessage } from '@/utils/errors'
import { formatDate } from '@/utils/format'

const roles: Role[] = ['RESIDENT', 'VOLUNTEER', 'ADMIN']

export default function AdminUsers() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState<User[] | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    getUsers().then(setUsers).catch(() => setError('Could not load users.'))
  }, [])

  useEffect(load, [load])

  const change = async (u: User, payload: { role?: Role; enabled?: boolean }) => {
    setError('')
    try {
      await updateUser(u.id, payload)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const controls = (u: User) =>
    u.id === me?.id ? (
      <span className="text-xs text-muted-foreground">This is you</span>
    ) : (
      <div className="flex flex-wrap items-center gap-2">
        <NativeSelect className="w-36" value={u.role} onChange={(e) => change(u, { role: e.target.value as Role })}>
          {roles.map((r) => <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>)}
        </NativeSelect>
        <Button size="sm" variant="outline" onClick={() => change(u, { enabled: !u.enabled })}>
          {u.enabled ? 'Disable' : 'Enable'}
        </Button>
      </div>
    )

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-primary">Manage Users</h1>
      {error && <p className="mt-4 text-destructive">{error}</p>}
      {!users && !error && <p className="mt-6 text-muted-foreground">Loading…</p>}

      {users && (
        <>
          <div className="mt-5 hidden overflow-x-auto rounded-xl border bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Role / Access</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">{u.enabled ? 'Active' : 'Disabled'}</td>
                    <td className="px-4 py-3">{controls(u)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 space-y-3 md:hidden">
            {users.map((u) => (
              <Card key={u.id}>
                <CardContent className="space-y-2 p-4">
                  <div className="font-semibold">{u.name}</div>
                  <div className="break-all text-sm text-muted-foreground">{u.email}</div>
                  <div className="text-xs text-muted-foreground">
                    {u.enabled ? 'Active' : 'Disabled'} &middot; Joined {formatDate(u.createdAt)}
                  </div>
                  {controls(u)}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}