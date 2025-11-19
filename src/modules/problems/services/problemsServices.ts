import api from '@/utils/servicesUtils'
import type { Problem, Protocol } from '@/modules/alerts/types/alertsTypes'

const problems = {
  getAll: (): Promise<{ data: { items: Problem[] } }> => api.get('/root-causes'),
}

export default problems
