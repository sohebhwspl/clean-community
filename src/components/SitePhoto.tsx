'use client'

import { useState, type ReactNode } from 'react'

const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']

interface Props {
  name: string
  alt: string
  className?: string
  fallback: ReactNode
}

export default function SitePhoto({ name, alt, className, fallback }: Props) {
  const [tried, setTried] = useState(0)
  if (tried >= EXTENSIONS.length) return <>{fallback}</>
  return (
    <img
      src={`/images/${name}.${EXTENSIONS[tried]}`}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setTried(tried + 1)}
    />
  )
}