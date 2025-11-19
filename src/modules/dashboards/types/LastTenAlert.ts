export interface LastTenAlert {
  id: number
  alertId: number
  indicator: string
  previousLevel: number
  newLevel: number
  location: string
  timestamp: string
  finalized: boolean
}

export type LastTenAlertsResponse = LastTenAlert[]
