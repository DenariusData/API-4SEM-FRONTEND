import api from '@/utils/servicesUtils'

export async function getRegionsLevel() {
  const response = await api.get('/alerts/per-region')
  return response.data
}
