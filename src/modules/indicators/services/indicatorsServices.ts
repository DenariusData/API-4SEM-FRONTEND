import api from '@/utils/servicesUtils.ts'
import type { Indicator } from '@/modules/indicators/types/indicatorsTypes.ts'

const indicators = {
  get: (): Promise<{ data: Indicator[] }> => api.get('/criteria'),
}

export default indicators
