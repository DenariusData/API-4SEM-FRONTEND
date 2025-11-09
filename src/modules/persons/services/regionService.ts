import api from '@/utils/servicesUtils'
import type { Region } from '../protocols/personProtocols'

export async function getRegions() {
  return await api.get<Region[]>('/regions')
}
