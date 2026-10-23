'use client'

import AdminDashboard from '@/views/dashboard/AdminDashboard'
import VolunteerDashboard from '@/views/dashboard/VolunteerDashboard'
import MyReports from '@/views/MyReports'
import { useAuth } from '@/hooks/useAuth'

export default function Dashboard() {
  const { user } = useAuth()
  if (!user) return null
  if (user.role === 'ADMIN') return <AdminDashboard />
  if (user.role === 'VOLUNTEER') return <VolunteerDashboard />
  return <MyReports />
}