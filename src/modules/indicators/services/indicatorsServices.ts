import api from '@/utils/servicesUtils.ts'
import type { IndicatorResponse } from '@/modules/indicators/types/indicatorsTypes.ts'

const indicators = {
  get: (): Promise<{ data: IndicatorResponse }> => api.get('/indicators'),
}

export default indicators
