import api from '@/utils/servicesUtils'
import type {
  HourlyVehiclesDTO,
  RoadDailyAggregateDTO,
  AroundTimeVehiclesDTO,
  VehiclesPerHourParams,
  RoadsDailyParams,
  AroundTimeParams
} from '../types/dashboardsTypes'


export async function getVehiclesPerHourForRoad(params: VehiclesPerHourParams) {
  const { regionId, roadId, start, end } = params
  return await api.get<HourlyVehiclesDTO[]>(
    `/v1/metrics/region/${regionId}/road/${roadId}/hourly`,
    {
      params: { start, end }
    }
  )
}

export async function getRoadsDailyAggregate(params: RoadsDailyParams) {
  const { regionId, date, start, end } = params
  
 
  const queryParams: Record<string, string> = {}
  
  if (date) {
    queryParams.date = date
  } else if (start) {
    queryParams.start = start
    if (end) {
      queryParams.end = end
    }
  }
  
  return await api.get<RoadDailyAggregateDTO[]>(
    `/v1/metrics/region/${regionId}/roads/daily`,
    { params: queryParams }
  )
}

export async function getVehiclesAroundTime(params: AroundTimeParams) {
  const { regionId, roadId, time, windowMinutes = 5 } = params
  return await api.get<AroundTimeVehiclesDTO>(
    `/v1/metrics/region/${regionId}/road/${roadId}/around`,
    {
      params: { time, windowMinutes }
    }
  )
}


export async function getAllRoadsDataForDate(regionId: number, date: string) {
  return await getRoadsDailyAggregate({ regionId, date })
}


export async function getAllRoadsDataForRange(
  regionId: number,
  start: string,
  end: string
) {
  return await getRoadsDailyAggregate({ regionId, start, end })
}


export async function getMultipleRoadsHourlyData(
  regionId: number,
  roadIds: number[],
  start: string,
  end: string
) {
  const promises = roadIds.map(roadId =>
    getVehiclesPerHourForRoad({ regionId, roadId, start, end })
  )
  
  return await Promise.all(promises)
}
