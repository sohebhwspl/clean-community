import api from './api'
import type { Role, User } from '@/types'

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone?: string
  role: Extract<Role, 'RESIDENT' | 'VOLUNTEER'>
}

export const register = async (payload: RegisterPayload) => (await api.post<User>('/auth/register', payload)).data
export const login = async (email: string, password: string) =>
  (await api.post<User>('/auth/login', { email, password })).data
export const logout = async () => {
  await api.post('/auth/logout')
}
export const getMe = async () => (await api.get<User>('/auth/me')).data
export const updateMe = async (name: string, phone: string) =>
  (await api.patch<User>('/auth/me', { name, phone })).data

export const forgotPassword = async (email: string) => {
  await api.post('/auth/forgot-password', { email })
}
export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  await api.post('/auth/reset-password', { email, otp, newPassword })
}
