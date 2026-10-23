import api from './api'
import type { EventStatus, EventView, RegistrationView } from '@/types'

export interface DrivePayload {
  title: string
  description: string
  date: string
  time: string
  location: string
  status?: EventStatus
}

export const getDrives = async (status?: EventStatus) =>
  (await api.get<EventView[]>('/cleanup-events', { params: { status } })).data

export const createDrive = async (payload: DrivePayload) => (await api.post<EventView>('/cleanup-events', payload)).data
export const updateDrive = async (id: number, payload: DrivePayload) =>
  (await api.patch<EventView>(`/cleanup-events/${id}`, payload)).data

export const joinDrive = async (id: number) => (await api.post<EventView>(`/cleanup-events/${id}/register`)).data
export const leaveDrive = async (id: number) => (await api.delete<EventView>(`/cleanup-events/${id}/register`)).data
export const getRegistrations = async (id: number) =>
  (await api.get<RegistrationView[]>(`/cleanup-events/${id}/registrations`)).data
