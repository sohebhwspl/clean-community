'use client'

import { Link } from '@/lib/router'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  label: string
  value: number | string
  to?: string
}

export default function StatCard({ label, value, to }: Props) {
  const card = (
    <Card className={to ? 'transition-shadow hover:shadow-md' : ''}>
      <CardContent className="p-4 text-center sm:p-5">
        <div className="text-2xl font-bold text-primary sm:text-3xl">{value}</div>
        <div className="text-xs text-muted-foreground sm:text-sm">{label}</div>
      </CardContent>
    </Card>
  )
  return to ? <Link to={to}>{card}</Link> : card
}