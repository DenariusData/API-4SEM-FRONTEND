export interface HourlyVehiclesDTO {
  hour: string // ISO DateTime
  vehicleCount: number
  roadId: number
  roadName?: string
}
export interface RoadDailyAggregateDTO {
  roadId: number
  roadName: string
  date: string // ISO Date
  totalVehicles: number
  averageSpeed?: number
  peakHourVehicles?: number
  peakHour?: string
}

export interface AroundTimeVehiclesDTO {
  centerTime: string // ISO DateTime
  windowMinutes: number
  beforeCount: number
  atTimeCount: number
  afterCount: number
  totalCount: number
  roadId: number
  roadName?: string
}

export interface VehiclesPerHourParams {
  regionId: number
  roadId: number
  start: string // ISO DateTime
  end: string // ISO DateTime
}

export interface RoadsDailyParams {
  regionId: number
  date?: string // ISO Date (formato: yyyy-MM-dd)
  start?: string // ISO Date (formato: yyyy-MM-dd)
  end?: string // ISO Date (formato: yyyy-MM-dd)
}

export interface AroundTimeParams {
  regionId: number
  roadId: number
  time: string // ISO DateTime
  windowMinutes?: number // default: 5
}


export interface Corridor {
  id: number
  name: string
  vehicles: number
  speed: number
}
export interface ZoneData {
  zone: string
  regionId: number
  corridors: Corridor[]
}
