export interface Indicator {
  id: number
  name: string
  description: string
  category: string
  unit: string
  minValue: number
  maxValue: number
}

export interface IndicatorResponse {
  items: Indicator[]
  total: number
}
