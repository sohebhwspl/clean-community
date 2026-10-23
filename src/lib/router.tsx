'use client'

// Thin adapter that keeps the page components written against the React Router
// API (Link, NavLink, useNavigate, useParams, useSearchParams) while running on
// the Next.js App Router.
import NextLink from 'next/link'
import { useParams as useNextParams, usePathname, useRouter, useSearchParams as useNextSearchParams } from 'next/navigation'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string; children?: ReactNode }

export function Link({ to, ...props }: LinkProps) {
  return <NextLink href={to} {...props} />
}

type NavLinkProps = Omit<LinkProps, 'className'> & {
  end?: boolean
  className?: string | ((state: { isActive: boolean }) => string)
}

export function NavLink({ to, end, className, ...props }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = end || to === '/' ? pathname === to : pathname === to || pathname.startsWith(`${to}/`)
  return <NextLink href={to} className={typeof className === 'function' ? className({ isActive }) : className} {...props} />
}

export function useNavigate() {
  const router = useRouter()
  return (to: string, options?: { replace?: boolean }) => (options?.replace ? router.replace(to) : router.push(to))
}

export function useParams() {
  return useNextParams<Record<string, string>>()
}

export function useSearchParams(): [URLSearchParams, (next: Record<string, string>) => void] {
  const router = useRouter()
  const pathname = usePathname()
  const params = useNextSearchParams()
  const setParams = (next: Record<string, string>) => {
    const qs = new URLSearchParams(next).toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }
  return [new URLSearchParams(params.toString()), setParams]
}
