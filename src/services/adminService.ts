import api from './api'
import type { DashboardData, IssueDetail, IssuePriority, IssueSummary, PageData, Role, User } from '@/types'
import type { IssueFilters } from './issueService'

export const getDashboard = async () => (await api.get<DashboardData>('/admin/dashboard')).data

export const getAdminIssues = async (filters: IssueFilters) => {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined))
  return (await api.get<PageData<IssueSummary>>('/admin/issues', { params })).data
}

export interface ReviewPayload {
  decision?: 'APPROVE' | 'REJECT' | 'DUPLICATE'
  reason?: string
  priority?: IssuePriority
}

export const reviewIssue = async (id: number, payload: ReviewPayload) =>
  (await api.patch<IssueDetail>(`/admin/issues/${id}/review`, payload)).data

export const assignIssue = async (id: number, volunteerId: number, notes: string) =>
  (await api.post<IssueDetail>(`/admin/issues/${id}/assign`, { volunteerId, notes })).data

export const verifyResolution = async (id: number, approved: boolean, note: string) =>
  (await api.patch<IssueDetail>(`/admin/issues/${id}/verify-resolution`, { approved, note })).data

export const getUsers = async (role?: Role) => (await api.get<User[]>('/admin/users', { params: { role } })).data

export const updateUser = async (id: number, payload: { role?: Role; enabled?: boolean }) =>
  (await api.patch<User>(`/admin/users/${id}`, payload)).data
