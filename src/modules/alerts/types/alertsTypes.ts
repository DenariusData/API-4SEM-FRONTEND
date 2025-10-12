export interface Alert {
  id: number
  indicator: string
  previousLevel: number
  newLevel: number
  location: string
  timestamp: string
}

export interface LastTenAlertsResponse {
  items: Alert[]
  total: number
}
