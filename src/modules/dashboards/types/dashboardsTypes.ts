export interface Period {
  label: string
  value: string
}

export interface CorridorData {
  name: string
  vehicles: number
  speed: number
}

export interface LineChartDataPoint {
  time: string
  value: number
}

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  tension?: number 
  pointBackgroundColor?: string
  pointBorderColor?: string
  pointRadius?: number
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export type ChartType = 'bar' | 'line'
