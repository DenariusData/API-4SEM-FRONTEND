import api from '@/utils/servicesUtils'
import type { Protocol } from '@/modules/alerts/types/alertsTypes'

const protocols = {
  getProtocol: (problemId: number): Promise<{ data: Protocol | null }> => api.get(`/protocols/${problemId}`),
}
export default protocols
