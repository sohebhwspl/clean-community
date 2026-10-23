import api from './api'
import type {
  HistoryEntry,
  ImageInfo,
  ImageType,
  IssueCategory,
  IssueDetail,
  IssuePriority,
  IssueStatus,
  IssueSummary,
  PageData,
} from '@/types'

export interface IssuePayload {
  title: string
  category: IssueCategory
  description: string
  location: string
  landmark?: string
  priority: IssuePriority
}

export interface IssueFilters {
  q?: string
  category?: IssueCategory | ''
  status?: IssueStatus | ''
  priority?: IssuePriority | ''
  page?: number
  size?: number
}

export const createIssue = async (payload: IssuePayload) => (await api.post<IssueDetail>('/issues', payload)).data

export const searchIssues = async (filters: IssueFilters) => {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined))
  return (await api.get<PageData<IssueSummary>>('/issues', { params })).data
}

export const getMyIssues = async (page = 0) =>
  (await api.get<PageData<IssueSummary>>('/issues/mine', { params: { page } })).data

export const getIssue = async (id: number) => (await api.get<IssueDetail>(`/issues/${id}`)).data
export const getHistory = async (id: number) => (await api.get<HistoryEntry[]>(`/issues/${id}/history`)).data

export const uploadImages = async (issueId: number, files: File[], type: ImageType) => {
  const form = new FormData()
  files.forEach((f) => form.append('files', f))
  form.append('type', type)
  return (await api.post<ImageInfo[]>(`/issues/${issueId}/images`, form)).data
}

export const deleteImage = async (issueId: number, imageId: number) => {
  await api.delete(`/issues/${issueId}/images/${imageId}`)
}
