'use client'

import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { IMAGE_TYPES, MAX_IMAGE_MB, MAX_IMAGES } from '@/utils/constants'

interface Props {
  files: File[]
  onChange: (files: File[]) => void
}

export default function ImagePicker({ files, onChange }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  const addFiles = (picked: FileList | null) => {
    if (!picked) return
    const next = [...files]
    setError('')
    for (const f of Array.from(picked)) {
      if (!IMAGE_TYPES.includes(f.type)) setError('Only JPEG, PNG and WebP images are allowed.')
      else if (f.size > MAX_IMAGE_MB * 1024 * 1024) setError(`Each image must be ${MAX_IMAGE_MB} MB or smaller.`)
      else if (next.length >= MAX_IMAGES) setError(`You can add up to ${MAX_IMAGES} photos.`)
      else next.push(f)
    }
    onChange(next)
    if (input.current) input.current.value = ''
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {files.map((f, i) => (
          <div key={`${f.name}-${i}`} className="relative aspect-square overflow-hidden rounded-lg border">
            <img src={URL.createObjectURL(f)} alt={f.name} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(files.filter((_, idx) => idx !== i))}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
              aria-label="Remove photo"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
        {files.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-sm text-muted-foreground hover:border-primary hover:text-primary"
          >
            <ImagePlus className="size-6" /> Add photo
          </button>
        )}
      </div>
      <input ref={input} type="file" accept={IMAGE_TYPES.join(',')} multiple hidden onChange={(e) => addFiles(e.target.files)} />
      <p className="mt-2 text-xs text-muted-foreground">
        Up to {MAX_IMAGES} photos (JPEG, PNG or WebP, {MAX_IMAGE_MB} MB each).
      </p>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}