'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { HistoryEntry } from '@/types'
import { formatDate, titleCase } from '@/utils/format'

export default function Timeline({ history }: { history: HistoryEntry[] }) {
  return (
    <Card className="h-fit">
      <CardContent className="p-4 sm:p-6">
        <h2 className="mb-4 font-semibold">Progress Timeline</h2>
        <ol className="space-y-4 border-l-2 border-secondary pl-4">
          {history.map((h) => (
            <li key={h.id} className="relative">
              <span className="absolute -left-[1.4rem] top-1 size-3 rounded-full bg-primary" />
              <div className="text-sm font-medium">{titleCase(h.toStatus)}</div>
              {h.note && <div className="break-words text-sm text-muted-foreground">{h.note}</div>}
              <div className="text-xs text-muted-foreground">
                {h.changedBy} &middot; {formatDate(h.createdAt)}
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}