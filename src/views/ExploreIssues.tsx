'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import IssueCard from '@/components/IssueCard'
import NativeSelect from '@/components/NativeSelect'
import Pagination from '@/components/Pagination'
import { searchIssues } from '@/services/issueService'
import type { IssueCategory, IssuePriority, IssueStatus, IssueSummary, PageData } from '@/types'
import { CATEGORIES, PRIORITIES, STATUSES } from '@/utils/constants'
import { titleCase } from '@/utils/format'

export default function ExploreIssues() {
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [category, setCategory] = useState<IssueCategory | ''>('')
  const [status, setStatus] = useState<IssueStatus | ''>('')
  const [priority, setPriority] = useState<IssuePriority | ''>('')
  const [page, setPage] = useState(0)
  const [data, setData] = useState<PageData<IssueSummary> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    searchIssues({ q, category, status, priority, page, size: 9 })
      .then((d) => {
        setData(d)
        setError('')
      })
      .catch(() => setError('Could not load issues. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [q, category, status, priority, page])

  const change = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v)
    setPage(0)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-primary">Explore Issues</h1>

      <form
        className="mt-5 grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-[2fr_1fr_1fr_1fr]"
        onSubmit={(e) => {
          e.preventDefault()
          setQ(search)
          setPage(0)
        }}
      >
        <div className="flex gap-2">
          <Input placeholder="Search title, location or ID (e.g. CC-0012)" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button type="submit" size="icon" aria-label="Search"><Search /></Button>
        </div>
        <NativeSelect value={category} onChange={(e) => change(setCategory)(e.target.value as IssueCategory | '')}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{titleCase(c)}</option>)}
        </NativeSelect>
        <NativeSelect value={status} onChange={(e) => change(setStatus)(e.target.value as IssueStatus | '')}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
        </NativeSelect>
        <NativeSelect value={priority} onChange={(e) => change(setPriority)(e.target.value as IssuePriority | '')}>
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{titleCase(p)}</option>)}
        </NativeSelect>
      </form>

      {error && <p className="mt-6 text-center text-destructive">{error}</p>}
      {loading && !data && <p className="mt-10 text-center text-muted-foreground">Loading…</p>}
      {data && data.content.length === 0 && (
        <p className="mt-10 rounded-lg border bg-white p-8 text-center text-muted-foreground">No issues match your search.</p>
      )}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data?.content.map((i) => <IssueCard key={i.id} issue={i} />)}
      </div>
      {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />}
    </div>
  )
}