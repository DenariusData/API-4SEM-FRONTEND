import api from '@/utils/servicesUtils'
import type { Problem, Protocol } from '@/modules/alerts/types/alertsTypes'

const problems = {
  getAll: (): Promise<{ data: { items: Problem[] } }> =>
    api.get('/problems'),

  getProtocol: (problemId: number): Promise<{ data: Protocol | null }> =>
    api.get(`/protocols/${problemId}`),
}

export default problems
