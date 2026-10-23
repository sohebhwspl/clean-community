'use client'

import { Link } from '@/lib/router'
import { Leaf } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-16 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-lg font-bold">
            <Leaf className="size-5" /> Clean Community
          </div>
          <p className="mt-2 text-sm text-primary-foreground/80">Report It. Clean It. Make a Difference.</p>
        </div>
        <div className="text-sm">
          <h4 className="mb-2 font-semibold">Quick Links</h4>
          <ul className="space-y-1 text-primary-foreground/80">
            <li><Link to="/report">Report Issue</Link></li>
            <li><Link to="/issues">Explore Issues</Link></li>
            <li><Link to="/drives">Cleanup Drives</Link></li>
            <li><Link to="/about">About Us</Link></li>
          </ul>
        </div>
        <div className="text-sm text-primary-foreground/80">
          <h4 className="mb-2 font-semibold text-primary-foreground">About the Project</h4>
          <p>A college project that helps residents report cleanliness problems and volunteers clean them up.</p>
        </div>
      </div>
      <div className="border-t border-white/20 py-4 text-center text-xs text-primary-foreground/70">
        &copy; {new Date().getFullYear()} Clean Community &middot; College Project
      </div>
    </footer>
  )
}