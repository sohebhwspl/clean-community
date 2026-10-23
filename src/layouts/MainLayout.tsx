import { Suspense, type ReactNode } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <Suspense>
        <Navbar />
      </Suspense>
      <main className="flex-1">
        <Suspense>{children}</Suspense>
      </main>
      <Footer />
    </div>
  )
}
