import api from '@/utils/servicesUtils'
import type { Region } from '../protocols/personProtocols'

export async function getRegions() {
  const response = await api.get<Region[]>('/regions')
  return response.data
}
