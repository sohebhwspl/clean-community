import api from './api'
import type { HomeData } from '@/types'

export async function getHomeData(): Promise<HomeData> {
  const { data } = await api.get<HomeData>('/home')
  return data
}
