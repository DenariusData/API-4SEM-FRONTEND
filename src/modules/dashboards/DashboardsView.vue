<template>
  <div class="dash-view">
    <h1>Dashboard dos Corredores Principais</h1>

    <div class="filters">
      <h3>Filtro</h3>
      <div class="filter-buttons">
        <button 
          v-for="period in periods" 
          :key="period.value"
          :class="['filter-btn', { active: selectedPeriod === period.value }]"
          @click="selectedPeriod = period.value"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <div class="corridor-cards">
      <div 
        v-for="corridor in corridorData" 
        :key="corridor.name" 
        class="corridor-card"
      >
        <h3 class="corridor-name">{{ corridor.name }}</h3>
        <div class="car-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
            <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
            <path d="M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5"></path>
          </svg>
        </div>
        <div class="stats">
          <p class="vehicle-count">{{ corridor.vehicles }} veículos/h</p>
          <p class="speed">{{ corridor.speed }} km/h</p>
        </div>
      </div>
    </div>

    <div class="chart-section">
      <h2>Comparativo de Fluxo</h2>
      <div class="chart-container">
        <canvas ref="barChartRef"></canvas>
      </div>
    </div>

    <div class="chart-section">
      <h2>Evolução do Dia</h2>
      <div class="chart-container">
        <canvas ref="lineChartRef"></canvas>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import type { Period, CorridorData, LineChartDataPoint } from '@/modules/dashboards/types/dashboardsTypes'

Chart.register(...registerables)

const selectedPeriod = ref<string>('dia-todo')

const barChartRef = ref<HTMLCanvasElement | null>(null)
const lineChartRef = ref<HTMLCanvasElement | null>(null)

let barChartInstance: Chart | null = null
let lineChartInstance: Chart | null = null

const periods = ref<Period[]>([
  { label: 'Manhã', value: 'manha' },
  { label: 'Tarde', value: 'tarde' },
  { label: 'Noite', value: 'noite' },
  { label: 'Dia Todo', value: 'dia-todo' }
])

const corridorData = ref<CorridorData[]>([
  { name: 'R. Bacabal', vehicles: 850, speed: 32 },
  { name: 'Av. Cassiano Ricardo', vehicles: 1200, speed: 28 },
  { name: "Av. Dr. Nélson d'Ávila", vehicles: 940, speed: 35 }
])

const getChartData = (period: string): number[] => {
  const baseData: Record<string, number[]> = {
    manha: [650, 900, 720],
    tarde: [850, 1200, 940],
    noite: [450, 800, 620],
    'dia-todo': [850, 1200, 940]
  }
  return baseData[period] || baseData['dia-todo']
}

const getLineChartData = (): LineChartDataPoint[] => [
  { time: '06:00', value: 200 },
  { time: '08:00', value: 450 },
  { time: '10:00', value: 600 },
  { time: '12:00', value: 350 },
  { time: '14:00', value: 800 },
  { time: '16:00', value: 750 },
  { time: '18:00', value: 900 },
  { time: '20:00', value: 550 },
  { time: '22:00', value: 300 },
  { time: '00:00', value: 150 }
]

const createBarChart = () => {
  if (barChartRef.value) {
    if (barChartInstance) barChartInstance.destroy()

    const data = getChartData(selectedPeriod.value)

    barChartInstance = new Chart(barChartRef.value, {
      type: 'bar',
      data: {
        labels: ['R. Bacabal', 'Av. Cassiano\nRicardo', "Av. Dr. Nelson\nd'Ávila"],
        datasets: [
          {
            label: 'Veículos/hora',
            data,
            backgroundColor: '#00c853',
            borderColor: '#00963e',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, title: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            max: 1500,
            ticks: { stepSize: 500, font: { size: 12 }, color: '#7a7a7a' },
            grid: { color: '#e0e0e0' }
          },
          x: {
            ticks: { font: { size: 11 }, maxRotation: 0, color: '#7a7a7a' },
            grid: { display: false }
          }
        }
      }
    })
  }
}

const createLineChart = () => {
  if (lineChartRef.value) {
    if (lineChartInstance) lineChartInstance.destroy()

    const lineData = getLineChartData()

    lineChartInstance = new Chart(lineChartRef.value, {
      type: 'line',
      data: {
        labels: lineData.map(item => item.time),
        datasets: [
          {
            label: 'Fluxo de Veículos',
            data: lineData.map(item => item.value),
            borderColor: '#4d4d4d',
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            pointBackgroundColor: '#4d4d4d',
            pointBorderColor: '#4d4d4d',
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            max: 1000,
            ticks: { stepSize: 500, font: { size: 12 }, color: '#7a7a7a' },
            grid: { color: '#e0e0e0' }
          },
          x: {
            ticks: { font: { size: 11 }, color: '#7a7a7a' },
            grid: { display: false }
          }
        }
      }
    })
  }
}

watch(selectedPeriod, () => {
  const data = getChartData(selectedPeriod.value)
  corridorData.value = corridorData.value.map((corridor: any, i: number) => ({
    ...corridor,
    vehicles: data[i]
  }))
  createBarChart()
})

onMounted(() => {
  createBarChart()
  createLineChart()
})
</script>

<style scoped lang="scss">
.dash-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
}

h1 {
  font-size: 2.5rem;
  font-weight: bold;
  color: #4d4d4d;
  margin-bottom: 30px;
  text-align: left;
}

.filters {
  margin-bottom: 30px;
  
  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #4d4d4d;
    margin-bottom: 15px;
  }
  
  .filter-buttons {
    display: flex;
    gap: 0;
    border: 2px solid #bdbdbd;
    border-radius: 8px;
    overflow: hidden;
    width: fit-content;
    
    .filter-btn {
      background: #ffffff;
      border: none;
      padding: 12px 24px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      border-right: 1px solid #bdbdbd;
      color: #4d4d4d;
      
      &:last-child {
        border-right: none;
      }
      
      &:hover {
        background: #f4f4f4;
      }
      
      &.active {
        background: #00c853;
        color: #ffffff;
      }
    }
  }
}

.corridor-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
  
  .corridor-card {
    flex: 1;
    background:#ffffff;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color:#4dde7d;
    }
    
    .corridor-name {
      font-size: 1.2rem;
      font-weight: 600;
      color: #4d4d4d;
      margin-bottom: 20px;
      min-height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .car-icon {
      margin-bottom: 20px;
      display: flex;
      justify-content: center;
      color: #7a7a7a;
      
      svg {
        transition: color 0.3s ease;
      }
    }
    
    &:hover .car-icon svg {
      color: #00c853;
    }
    
    .stats {
      .vehicle-count {
        font-size: 1.4rem;
        font-weight: bold;
        color: #4d4d4d;
        margin-bottom: 8px;
      }
      
      .speed {
        font-size: 1.2rem;
        color: #7a7a7a;
        font-weight: 500;
      }
    }
  }
}

.chart-section {
  margin-bottom: 40px;
  
  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #4d4d4d;
    margin-bottom: 20px;
  }
  
  .chart-container {
    background: #ffffff;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    padding: 20px;
    height: 400px;
    position: relative;
    
    canvas {
      max-height: 100%;
    }
  }
}

@media (max-width: 768px) {
  .corridor-cards {
    flex-direction: column;
  }
  
  .filter-buttons {
    flex-wrap: wrap;
    
    .filter-btn {
      flex: 1;
      min-width: 120px;
    }
  }
  
  h1 {
    font-size: 2rem;
  }
}
</style>
