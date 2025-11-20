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

export interface LastTenAlertsResponse extends Array<Alert> {}

// New types for AlertsView
export interface AlertListItem {
  alertId: number
  alertRegion: string
  criterionName: string
  alertClosedAt: string | null
}

export interface AlertLog {
  alertLogId: number
  logDatetime: string
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

export interface AlertDetails {
  id: number
  alert_id: number
  indicator: string
  currentLevel: number
  previousLevel: number
  location: string
  timestamp: string
  finalized: boolean
  radar_id?: string
  zone?: string
  description?: string
  affected_radars?: string[]
}

export interface Problem {
  id: number
  name: string
  description: string
}

export interface Protocol {
  id: number
  problem_id: number
  title: string
  steps: string[]
}

export interface Agent {
  id: number
  name: string
  phone: string
  available: boolean
}
