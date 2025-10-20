import api from '@/utils/servicesUtils'
import type {
  LastTenAlertsResponse,
  AlertDetails
} from '@/modules/alerts/types/alertsTypes'

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

  finalizeAlert: (id: number, data?: FinalizeAlertPayload): Promise<{ data: FinalizeAlertResponse }> =>
    api.post(`/alerts/${id}/finalize`, data),
}

export default alerts
