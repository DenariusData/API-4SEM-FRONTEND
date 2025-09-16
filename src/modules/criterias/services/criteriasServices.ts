import api from '@/utils/servicesUtils.ts'
import type { CriteriaResponse } from '@/modules/criterias/types/criteriasTypes.ts'

const criterias = {
  get: (): Promise<{ data: CriteriaResponse }> => api.get('/criterias'),
}

export default criterias
