'use client'

import { Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { ImageInfo, ImageType } from '@/types'

const groups: { type: ImageType; label: string }[] = [
  { type: 'BEFORE', label: 'Before cleanup' },
  { type: 'PROGRESS', label: 'Progress' },
  { type: 'AFTER', label: 'After cleanup' },
]

interface Props {
  images: ImageInfo[]
  canDelete?: (img: ImageInfo) => boolean
  onDelete?: (img: ImageInfo) => void
}

export default function ImageGallery({ images, canDelete, onDelete }: Props) {
  return (
    <>
      {groups.map(({ type, label }) => {
        const imgs = images.filter((i) => i.type === type)
        if (imgs.length === 0) return null
        return (
          <Card key={type}>
            <CardContent className="p-4 sm:p-6">
              <h2 className="mb-3 font-semibold">{label}</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {imgs.map((img) => (
                  <div key={img.id} className="relative overflow-hidden rounded-lg border">
                    <a href={`/api/files/${img.id}`} target="_blank" rel="noreferrer">
                      <img src={`/api/files/${img.id}`} alt={label} loading="lazy" className="aspect-square w-full object-cover" />
                    </a>
                    {canDelete?.(img) && (
                      <button
                        onClick={() => onDelete?.(img)}
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-1.5 text-white"
                        aria-label="Delete photo"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </>
  )
}