'use client'

import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

interface Props {
  label: string
  error?: string
  children: ReactNode
}

export default function FormField({ label, error, children }: Props) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}