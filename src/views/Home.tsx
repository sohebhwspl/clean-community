'use client'

import { Link } from '@/lib/router'
import { CheckCircle2, ClipboardList, Eye, Leaf, Sparkles, Trash2, Users, Wrench } from 'lucide-react'
import LinkButton from '@/components/LinkButton'
import IssueCard from '@/components/IssueCard'
import DriveCard from '@/components/DriveCard'
import SitePhoto from '@/components/SitePhoto'
import { useFetch } from '@/hooks/useFetch'
import { getHomeData } from '@/services/homeService'

const steps = [
  { icon: ClipboardList, title: 'Report', text: 'Share the problem with photos and a location.' },
  { icon: Eye, title: 'Review', text: 'Admins check the report and set a priority.' },
  { icon: Wrench, title: 'Clean', text: 'A volunteer cleans the area and posts updates.' },
  { icon: CheckCircle2, title: 'Resolve', text: 'The work is verified and the issue is closed.' },
]

export default function Home() {
  const { data, loading, error } = useFetch(getHomeData)

  const stats = [
    { label: 'Total Reports', value: data?.stats.totalReports },
    { label: 'Resolved Issues', value: data?.stats.resolvedIssues },
    { label: 'Active Volunteers', value: data?.stats.activeVolunteers },
    { label: 'Cleanup Drives', value: data?.stats.cleanupDrives },
  ]

  return (
    <div>
      <section className="bg-gradient-to-br from-primary to-emerald-700 text-primary-foreground">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm">
              <Sparkles className="size-4" /> Report It. Clean It. Make a Difference.
            </p>
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">Together, Let's Make Our Community Cleaner.</h1>
            <p className="mt-4 text-primary-foreground/85">
              Spot garbage, a full dustbin or a blocked drain? Report it in a minute, track the cleanup, and join
              neighbours who care about the place they live.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton to="/report" size="lg" variant="secondary">Report an Issue</LinkButton>
              <LinkButton
                to="/issues"
                size="lg"
                variant="outline"
                className="border-white/60 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Explore Issues
              </LinkButton>
            </div>
          </div>
          <div className="hidden justify-center md:flex">
            <SitePhoto
              name="hero"
              alt="Community members cleaning up"
              className="h-72 w-full max-w-md rounded-2xl object-cover shadow-lg"
              fallback={
                <div className="flex size-64 items-center justify-center rounded-full bg-white/10">
                  <Leaf className="size-32 text-emerald-100" />
                </div>
              }
            />
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-8 max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-4 rounded-xl border bg-white p-6 shadow-sm md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-primary">{loading ? '…' : (s.value ?? '–')}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
        {error && <p className="mt-3 text-center text-sm text-destructive">{error}</p>}
      </section>

      <section className="mx-auto mt-14 max-w-6xl px-4">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Recent Issues</h2>
          <Link to="/issues" className="text-sm font-medium text-primary hover:underline">View all</Link>
        </div>
        {!loading && data?.recentIssues.length === 0 && (
          <p className="rounded-lg border bg-white p-6 text-center text-muted-foreground">No issues reported yet. Be the first!</p>
        )}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data?.recentIssues.map((i) => <IssueCard key={i.id} issue={i} />)}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-6xl px-4">
        <h2 className="mb-5 text-center text-2xl font-bold">How It Works</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-xl border bg-white p-5 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                <s.icon className="size-6" />
              </div>
              <h3 className="mt-3 font-semibold">{i + 1}. {s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-6xl px-4">
        <h2 className="mb-5 text-center text-2xl font-bold">Before &amp; After</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: 'Before', file: 'before', icon: Trash2, tone: 'bg-stone-200 text-stone-500' },
            { label: 'After', file: 'after', icon: Sparkles, tone: 'bg-secondary text-primary' },
          ].map((p) => (
            <div key={p.label} className={`relative flex h-56 items-center justify-center overflow-hidden rounded-xl sm:h-64 ${p.tone}`}>
              <SitePhoto
                name={p.file}
                alt={`${p.label} cleanup`}
                className="h-full w-full object-cover"
                fallback={<p.icon className="size-16 opacity-60" />}
              />
              <span className="absolute left-3 top-3 rounded bg-white/90 px-2 py-0.5 text-xs font-semibold text-foreground">{p.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-6xl px-4">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-bold"><Users className="size-6 text-primary" /> Upcoming Cleanup Drives</h2>
          <Link to="/drives" className="text-sm font-medium text-primary hover:underline">View all</Link>
        </div>
        {!loading && data?.upcomingDrives.length === 0 && (
          <p className="rounded-lg border bg-white p-6 text-center text-muted-foreground">No upcoming drives right now.</p>
        )}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data?.upcomingDrives.map((d) => <DriveCard key={d.id} drive={d} />)}
        </div>
      </section>
    </div>
  )
}