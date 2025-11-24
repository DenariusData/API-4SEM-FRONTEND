import api from '@/utils/servicesUtils.ts'

interface CriterionResponse {
  id: number
  name: string
  description: string
  example: string
  mathExpression: string
}

const criterion = {
  getCriteria: (): Promise<{ data: CriterionResponse[] }> => api.get('/criterion/summary'),
}

export default criterion
