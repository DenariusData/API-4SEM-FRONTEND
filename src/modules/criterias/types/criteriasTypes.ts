export interface Criteria {
  id: number
  name: string
  description: string
}

export interface CriteriaResponse {
  items: Criteria[]
  total: number
}
