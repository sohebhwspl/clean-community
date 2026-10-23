import MainLayout from '@/layouts/MainLayout'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>
}
