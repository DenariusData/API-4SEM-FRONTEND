import api from '@/utils/servicesUtils.ts'
import type { LastTenAlertsResponse } from '@/modules/alerts/types/alertsTypes.ts'

const alerts = {
  getLastTen: (): Promise<{ data: LastTenAlertsResponse }> => api.get('/alerts/last-ten'),
}

export default alerts
