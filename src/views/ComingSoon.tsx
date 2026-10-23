'use client'

import { SearchX } from 'lucide-react'
import LinkButton from '@/components/LinkButton'

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center">
      <SearchX className="size-12 text-primary/50" />
      <h1 className="mt-4 text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-muted-foreground">We could not find what you were looking for.</p>
      <LinkButton to="/" className="mt-5">Back to Home</LinkButton>
    </div>
  )
}