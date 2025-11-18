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

interface CriterionResponse {
  id: number
  name: string
  description: string
  example: string
  mathExpression: string
}

const alerts = {
  getLastTen: (): Promise<{ data: LastTenAlertsResponse }> =>
    api.get('/alerts/last-ten'),

  getDetails: (id: number): Promise<{ data: AlertDetails }> =>
    api.get(`/alerts/${id}/details`),

  finalizeAlert: (id: number, data?: FinalizeAlertPayload): Promise<{ data: FinalizeAlertResponse }> =>
    api.post(`/alerts/${id}/finalize`, data),

  getTop5ByRegion: (regionId: number): Promise<{ data: any[] }> =>
    api.get(`/alerts/top5/region/${regionId}`),

  getTop5ByRegionAndCriterion: (
    regionId: number,
    criterionId: number
  ): Promise<{ data: any[] }> =>
    api.get(`/alerts/top5/region/${regionId}/criterion/${criterionId}`),

  search: (params: AlertSearchParams): Promise<{ data: AlertSearchResponse }> => {
    const queryParams = new URLSearchParams()

    if (params.regionIds && params.regionIds.length > 0) {
      params.regionIds.forEach(id => queryParams.append('regionIds', id.toString()))
    }
    if (params.startDate) queryParams.append('startDate', params.startDate)
    if (params.endDate) queryParams.append('endDate', params.endDate)
    if (params.page !== undefined) queryParams.append('page', params.page.toString())
    if (params.size !== undefined) queryParams.append('size', params.size.toString())

    return api.get(`/alerts/search?${queryParams.toString()}`)
  },

  getCriteria: (): Promise<{ data: CriterionResponse[] }> =>
    api.get('/criterion/summary')
}

export default alerts
