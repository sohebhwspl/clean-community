'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/types'

export default function ProtectedRoute({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const allowed = !!user && (!roles || roles.includes(user.role))

  useEffect(() => {
    if (loading) return
    if (!user) router.replace(`/login?from=${encodeURIComponent(pathname)}`)
    else if (!allowed) router.replace('/')
  }, [loading, user, allowed, pathname, router])

  if (loading || !allowed) return <p className="py-24 text-center text-muted-foreground">Loading…</p>
  return <>{children}</>
}
