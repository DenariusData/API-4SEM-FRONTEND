import api from '@/utils/servicesUtils'
import type {
  LastTenAlertsResponse,
  AlertDetails,
  AlertListItem,
  AlertLog,
  Pageable,
} from '@/modules/alerts/types/alertsTypes'

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

  getDetails: (id: number): Promise<{ data: AlertDetails }> => api.get(`/alerts/${id}`),

  finalizeAlert: (id: number, conclusion?: string): Promise<{ data: FinalizeAlertResponse }> =>
    api.post(`/alerts/${id}/finalize`, null, {
      params: conclusion ? { conclusion } : undefined,
    }),

  getRegionsLevel: (): Promise<any> => api.get('/alerts/per-region'),

  getRegionsAlerts: (regionIds: number[]): Promise<any> => api.get('/alerts/active', { params: { regionIds } }),

  getTop5ByRegion: (regionIds: number[]): Promise<{ data: any[] }> =>
    api.get('/alerts/top5/region', { params: { regionIds } }),

  getTop5ByRegionAndCriterion: (regionIds: number[], criterionId: number): Promise<{ data: any[] }> =>
    api.get(`/alerts/top5/region/criterion/${criterionId}`, { params: { regionIds } }),

  search: (params: AlertSearchParams): Promise<{ data: AlertSearchResponse }> => {
    const queryParams = new URLSearchParams()

    if (params.regionIds && params.regionIds.length > 0) {
      params.regionIds.forEach((id) => queryParams.append('regionIds', id.toString()))
    }
    if (params.startDate) queryParams.append('startDate', params.startDate)
    if (params.endDate) queryParams.append('endDate', params.endDate)
    if (params.page !== undefined) queryParams.append('page', params.page.toString())
    if (params.size !== undefined) queryParams.append('size', params.size.toString())

    return api.get(`/alerts/search?${queryParams.toString()}`)
  },

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
    },
  ): Promise<{ data: Pageable<AlertListItem[]> }> =>
    api.get('/alerts/history', {
      params: {
        page,
        size,
        ...filters,
      },
    }),

  getAlertLogs: (alertId: number): Promise<{ data: AlertLog[] }> => api.get(`/alerts/${alertId}/logs`),
}

export default alerts
