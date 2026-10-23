'use client'

import { Link } from '@/lib/router'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { UpcomingDrive } from '@/types'
import { formatDate, formatTime } from '@/utils/format'

export default function DriveCard({ drive }: { drive: UpcomingDrive }) {
  return (
    <Link to="/drives">
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="space-y-2 p-5">
          <h3 className="break-words font-semibold">{drive.title}</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="size-4" /> {formatDate(drive.date)}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4" /> {formatTime(drive.time)}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4" /> {drive.location}
            </div>
            <div className="flex items-center gap-2">
              <Users className="size-4" /> {drive.participants} joined
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}