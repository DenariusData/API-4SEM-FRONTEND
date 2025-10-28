import api from '@/utils/servicesUtils'
import type { Agent } from '@/modules/alerts/types/alertsTypes'

const users = {
  getAgents: (): Promise<{ data: { items: Agent[] } }> =>
    api.get('/agents'),
}

export default users
