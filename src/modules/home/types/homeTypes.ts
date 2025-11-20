export interface Criterion {
  id: number
  name: string
  description: string
  example?: string
  mathExpression?: string
}

export interface ZoneMetric {
  id: number
  name: string
  description?: string
  nivel: number
  region?: string
}

export interface Alert {
  id: number
  alertId?: number
  criterionId?: number
  criterionName?: string
  level: number
  newLevel?: number
  previousLevel?: number
  message: string
  location?: string
  regionName?: string
  createdAt: string
  timestamp?: string
  status?: string
  finalized?: boolean
  indicator?: string
}

export interface SelectedRegion {
  name: string
  level: number
}

export interface Region {
  id: number
  name: string
}

export interface GeoJsonFeature {
  properties?: {
    regiao?: string
    layer?: string
    color?: string
  }
}
