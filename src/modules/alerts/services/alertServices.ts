import api from '@/utils/servicesUtils.ts'
import type {
  LastTenAlertsResponse,
  AlertDetails,
  Problem,
  Protocol,
  Agent
} from '@/modules/alerts/types/alertsTypes.ts'

interface FinalizeAlertPayload {
  problem_id?: number
  notes?: string
  agent_id?: number
}

interface FinalizeAlertResponse {
  success: boolean
  message: string
  alert_id: number
}

const alerts = {
  getLastTen: (): Promise<{ data: LastTenAlertsResponse }> =>
    api.get('/alerts/last-ten'),

  getDetails: (id: number): Promise<{ data: AlertDetails }> =>
    api.get(`/alerts/${id}/details`),

  getProblems: (): Promise<{ data: { items: Problem[] } }> =>
    api.get('/problems'),

  getProtocol: (problemId: number): Promise<{ data: Protocol | null }> =>
    api.get(`/protocols/${problemId}`),

  getAgents: (): Promise<{ data: { items: Agent[] } }> =>
    api.get('/agents'),

  finalizeAlert: (id: number, data?: FinalizeAlertPayload): Promise<{ data: FinalizeAlertResponse }> =>
    api.post(`/alerts/${id}/finalize`, data),
}

export default alerts
