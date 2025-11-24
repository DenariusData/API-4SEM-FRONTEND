export interface Alert {
  id: number
  alertId: number
  indicator: string
  previousLevel: number
  newLevel: number
  location: string
  timestamp: string
  finalized: boolean
}

export type LastTenAlertsResponse = Array<Alert>

export interface AlertListItem {
  id: number
  level: number
  message: string
  conclusion: string | null
  sourceType: string
  createdAt: string
  closedAt: string | null
  createdByName: string | null
  assignedToName: string | null
  criterionName: string
  criterionId: number
  regionName: string
  regionId: number
  rootCauseName: string | null
  protocolName: string | null
  isOpen: boolean
  status: string
}

export interface AlertLog {
  id: number
  createdAt: string
  previousLevel: number
  newLevel: number
}

export interface Pageable<T> {
  content: T
  totalPages: number
  totalElements: number
  size: number
  number: number
}

export interface AlertFilters {
  regionIds?: number[]
  criterionIds?: number[]
  levels?: number[]
  isOpen?: boolean
  startDate?: string
  endDate?: string
}

export interface AlertDetails {
  id: number
  alert_id: number
  indicator: string
  currentLevel: number
  previousLevel: number
  location: string | undefined
  timestamp: string
  finalized: boolean
  radar_id?: string
  zone?: string
  description?: string
  affected_radars?: string[]
  message: string
  sourceType: string
  level: number
  criterionName: string
  regionName: string
  createdAt: string
  closedAt?: string | null
  conclusion?: string | null
  rootCauseName?: string | null
  isOpen: boolean
  status: string
}

export interface Problem {
  id: number
  name: string
  description: string
}

export interface Protocol {
  id: number
  name: string
  description: string
  createdAt: string
  createdByName: string
}

export interface Agent {
  id: number
  name: string
  phone: string
  available: boolean
}
