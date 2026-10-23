'use client'

import { useState } from 'react'
import { Link, NavLink, useNavigate } from '@/lib/router'
import { Leaf, Menu, UserCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LinkButton from '@/components/LinkButton'
import { useAuth } from '@/hooks/useAuth'

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/report', label: 'Report Issue' },
  { to: '/issues', label: 'Explore Issues' },
  { to: '/drives', label: 'Cleanup Drives' },
  { to: '/about', label: 'About Us' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const roleLinks = !user
    ? []
    : user.role === 'ADMIN'
      ? [
          { to: '/dashboard', label: 'Dashboard' },
          { to: '/admin/issues', label: 'Manage Issues' },
          { to: '/admin/users', label: 'Users' },
        ]
      : user.role === 'VOLUNTEER'
        ? [{ to: '/dashboard', label: 'My Tasks' }]
        : [{ to: '/dashboard', label: 'My Reports' }]

  const links = [...publicLinks, ...roleLinks]

  const handleLogout = async () => {
    await logout()
    setOpen(false)
    navigate('/')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-foreground/70'}`

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-lg font-bold text-primary">
          <Leaf className="size-6" /> Clean Community
        </Link>

        <nav className="hidden items-center gap-4 xl:gap-5 lg:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {user ? (
            <>
              <LinkButton to="/profile" variant="ghost" size="sm">
                <UserCircle className="size-4" /> {user.name.split(' ')[0]}
              </LinkButton>
              <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <LinkButton to="/login" variant="ghost" size="sm">Login</LinkButton>
              <LinkButton to="/register" size="sm">Register</LinkButton>
            </>
          )}
        </div>

        <button className="p-1 lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <nav className="flex max-h-[80vh] flex-col gap-1 overflow-y-auto border-t bg-white px-4 py-3 lg:hidden" onClick={() => setOpen(false)}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={(s) => `${linkClass(s)} py-2.5`}>
              {l.label}
            </NavLink>
          ))}
          <div className="my-1 border-t" />
          {user ? (
            <>
              <NavLink to="/profile" className={(s) => `${linkClass(s)} py-2.5`}>Profile ({user.name.split(' ')[0]})</NavLink>
              <button className="py-2.5 text-left text-sm font-medium text-foreground/70" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={(s) => `${linkClass(s)} py-2.5`}>Login</NavLink>
              <NavLink to="/register" className={(s) => `${linkClass(s)} py-2.5`}>Register</NavLink>
            </>
          )}
        </nav>
      )}
    </header>
  )
}