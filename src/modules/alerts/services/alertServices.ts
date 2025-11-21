import api from '@/utils/servicesUtils'
import type {
  LastTenAlertsResponse,
  AlertDetails,
  AlertListItem,
  AlertLog,
  Pageable
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

interface AlertSearchParams {
  regionIds?: number[]
  startDate?: string
  endDate?: string
  page?: number
  size?: number
}

interface AlertSearchResponse {
  content: any[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

const alerts = {
  getLastTen: (): Promise<{ data: LastTenAlertsResponse }> => api.get('/alerts/last-ten'),

  getDetails: (id: number): Promise<{ data: AlertDetails }> => api.get(`/alerts/${id}/details`),

  finalizeAlert: (id: number, data?: FinalizeAlertPayload): Promise<{ data: FinalizeAlertResponse }> =>
    api.post(`/alerts/${id}/finalize`, data),

  getAlerts: (
    page: number = 0,
    size: number = 10,
    filters?: {
      regionIds?: number[]
      criterionIds?: number[]
      levels?: number[]
      isOpen?: boolean
      startDate?: string
      endDate?: string
    }
  ): Promise<{ data: Pageable<AlertListItem[]> }> =>
    api.get('/alerts/history', {
      params: {
        page,
        size,
        ...filters,
      },
    }),

  getAlertLogs: (alertId: number): Promise<{ data: AlertLog[] }> =>
    api.get(`/alerts/${alertId}/logs`),
}

export default alerts
