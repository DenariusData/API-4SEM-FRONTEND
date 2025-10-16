// ADICIONE estes tipos ao seu arquivo existente

export interface Alert {
  id: number
  alert_id: number
  indicator: string
  previousLevel: number
  newLevel: number
  location: string
  timestamp: string
  finalized: boolean
}

export interface LastTenAlertsResponse {
  items: Alert[]
  total: number
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
