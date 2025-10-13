export interface CriterionRange {
  level: number
  range: string
}

export interface Indicator {
  id: number
  name: string
  description: string
  category: string
  unit: string
  minValue: number
  maxValue: number
  example: string
  purpose: string
  ranges: CriterionRange[]
  details: string
  nullValue: string
}

export interface IndicatorResponse {
  items: Indicator[]
  total: number
}
