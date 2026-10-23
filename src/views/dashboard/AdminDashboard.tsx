'use client'

import { Link } from '@/lib/router'
import { ClipboardList, Users, CalendarDays } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'
import { useFetch } from '@/hooks/useFetch'
import { getDashboard } from '@/services/adminService'
import type { IssueStatus } from '@/types'
import { titleCase } from '@/utils/format'

const quickLinks = [
  { to: '/admin/issues', label: 'Manage Issues', icon: ClipboardList },
  { to: '/admin/users', label: 'Manage Users', icon: Users },
  { to: '/drives', label: 'Manage Drives', icon: CalendarDays },
]

export default function AdminDashboard() {
  const { data, loading, error } = useFetch(getDashboard)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
      {loading && <p className="mt-6 text-muted-foreground">Loading…</p>}
      {error && <p className="mt-6 text-destructive">{error}</p>}

      {data && (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard label="Total Reports" value={data.totalIssues} to="/admin/issues" />
            <StatCard label="Awaiting Review" value={data.awaitingReview} to="/admin/issues?status=SUBMITTED" />
            <StatCard label="Awaiting Verification" value={data.awaitingVerification} to="/admin/issues?status=IN_PROGRESS" />
            <StatCard label="Upcoming Drives" value={data.upcomingDrives} to="/drives" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="mb-3 font-semibold">Issues by status</h2>
                <ul className="space-y-2">
                  {(Object.entries(data.issuesByStatus) as [IssueStatus, number][]).map(([status, count]) => (
                    <li key={status}>
                      <Link to={`/admin/issues?status=${status}`} className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-muted">
                        <StatusBadge status={status} />
                        <span className="text-sm font-medium">{count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h2 className="mb-3 font-semibold">Users</h2>
                  <ul className="space-y-1 text-sm">
                    {Object.entries(data.usersByRole).map(([role, count]) => (
                      <li key={role} className="flex justify-between">
                        <span className="text-muted-foreground">{titleCase(role)}s</span>
                        <span className="font-medium">{count}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <div className="grid gap-3">
                {quickLinks.map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to} className="flex items-center gap-3 rounded-xl border bg-white p-4 font-medium transition-shadow hover:shadow-md">
                    <Icon className="size-5 text-primary" /> {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}