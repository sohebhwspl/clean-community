'use client'

import { useEffect, useState } from 'react'
import { Link, useSearchParams } from '@/lib/router'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import NativeSelect from '@/components/NativeSelect'
import Pagination from '@/components/Pagination'
import StatusBadge from '@/components/StatusBadge'
import { getAdminIssues, setIssueActive } from '@/services/adminService'
import { Badge } from '@/components/ui/badge'
import type { IssueStatus, IssueSummary, PageData } from '@/types'
import { STATUSES } from '@/utils/constants'
import { formatDate, issueCode, titleCase } from '@/utils/format'

export default function AdminIssues() {
  const [params, setParams] = useSearchParams()
  const status = (params.get('status') ?? '') as IssueStatus | ''
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const [data, setData] = useState<PageData<IssueSummary> | null>(null)
  const [active, setActive] = useState<'true' | 'false' | ''>('true')
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    getAdminIssues({ q, status, active, page, size: 10 })
      .then((d) => {
        setData(d)
        setError('')
      })
      .catch(() => setError('Could not load issues.'))
  }, [q, status, active, page, reload])

  const toggleActive = async (i: IssueSummary) => {
    const message = i.active
      ? `Deactivate ${issueCode(i.id)}? It will be hidden from everyone except admins. You can activate it again later.`
      : `Activate ${issueCode(i.id)} again?`
    if (!window.confirm(message)) return
    try {
      await setIssueActive(i.id, !i.active)
      setReload((n) => n + 1)
    } catch {
      setError('Could not update the issue.')
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-primary">Manage Issues</h1>

      <form
        className="mt-4 grid gap-3 rounded-xl border bg-white p-3 sm:grid-cols-[1fr_200px_150px] sm:p-4"
        onSubmit={(e) => {
          e.preventDefault()
          setQ(search)
          setPage(0)
        }}
      >
        <div className="flex gap-2">
          <Input placeholder="Search title, location or ID" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button type="submit" size="icon" aria-label="Search"><Search /></Button>
        </div>
        <NativeSelect
          value={status}
          onChange={(e) => {
            setParams(e.target.value ? { status: e.target.value } : {})
            setPage(0)
          }}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
        </NativeSelect>
        <NativeSelect
          value={active}
          onChange={(e) => {
            setActive(e.target.value as 'true' | 'false' | '')
            setPage(0)
          }}
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
          <option value="">Active + inactive</option>
        </NativeSelect>
      </form>

      {error && <p className="mt-6 text-destructive">{error}</p>}
      {data && data.content.length === 0 && (
        <p className="mt-6 rounded-lg border bg-white p-8 text-center text-muted-foreground">No issues found.</p>
      )}

      {data && data.content.length > 0 && (
        <>
          <div className="mt-5 hidden overflow-x-auto rounded-xl border bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.content.map((i) => (
                  <tr key={i.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium text-primary">
                      <Link to={`/issues/${i.id}`}>{issueCode(i.id)}</Link>
                    </td>
                    <td className="max-w-[240px] truncate px-4 py-3">
                      {i.title} {!i.active && <Badge variant="outline" className="ml-1 border-transparent bg-gray-200 text-gray-700">Inactive</Badge>}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground">{i.location}</td>
                    <td className="px-4 py-3">{titleCase(i.priority)}</td>
                    <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDate(i.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => toggleActive(i)}>{i.active ? 'Deactivate' : 'Activate'}</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 space-y-3 md:hidden">
            {data.content.map((i) => (
              <Link key={i.id} to={`/issues/${i.id}`}>
                <Card className="mb-3">
                  <CardContent className="space-y-1.5 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-primary">{issueCode(i.id)}</span>
                      <StatusBadge status={i.status} />
                    </div>
                    <div className="font-semibold">
                      {i.title} {!i.active && <Badge variant="outline" className="ml-1 border-transparent bg-gray-200 text-gray-700">Inactive</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">{i.location}</div>
                    <div className="text-xs text-muted-foreground">
                      {titleCase(i.priority)} priority &middot; {formatDate(i.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}