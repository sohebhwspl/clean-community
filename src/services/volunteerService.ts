import api from './api'
import type { ImageType, TaskView } from '@/types'

export const getTasks = async (completed: boolean) =>
  (await api.get<TaskView[]>('/volunteer/tasks', { params: { completed } })).data

export const getTask = async (id: number) => (await api.get<TaskView>(`/volunteer/tasks/${id}`)).data

export const updateTaskStatus = async (id: number, action: 'START' | 'COMPLETE', note: string) =>
  (await api.patch<TaskView>(`/volunteer/tasks/${id}/status`, { action, note })).data

export const addProgress = async (id: number, note: string, type: ImageType, files: File[]) => {
  const form = new FormData()
  if (note.trim()) form.append('note', note.trim())
  form.append('type', type)
  files.forEach((f) => form.append('files', f))
  return (await api.post<TaskView>(`/volunteer/tasks/${id}/progress`, form)).data
}
