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
