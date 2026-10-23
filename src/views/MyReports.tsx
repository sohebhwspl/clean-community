'use client'

import { useEffect, useState } from 'react'
import IssueCard from '@/components/IssueCard'
import LinkButton from '@/components/LinkButton'
import Pagination from '@/components/Pagination'
import { getMyIssues } from '@/services/issueService'
import type { IssueSummary, PageData } from '@/types'

export default function MyReports() {
  const [page, setPage] = useState(0)
  const [data, setData] = useState<PageData<IssueSummary> | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getMyIssues(page)
      .then(setData)
      .catch(() => setError('Could not load your reports.'))
  }, [page])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-primary">My Reports</h1>
        <LinkButton to="/report" size="sm">New Report</LinkButton>
      </div>
      {error && <p className="mt-6 text-destructive">{error}</p>}
      {data && data.content.length === 0 && (
        <p className="mt-10 rounded-lg border bg-white p-8 text-center text-muted-foreground">You have not reported anything yet.</p>
      )}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data?.content.map((i) => <IssueCard key={i.id} issue={i} />)}
      </div>
      {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />}
    </div>
  )
}