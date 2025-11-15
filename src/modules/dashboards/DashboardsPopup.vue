<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { Chart, registerables } from 'chart.js'
import CorridorCard from './CorridorCard.vue'
import ComparisonZones from './components/ComparisonZones.vue'

Chart.register(...registerables)

const props = defineProps<{
  filteredZones: string[]
}>()

const emit = defineEmits(['close'])

const isZoneAvailable = (zone: string) => {
  if (props.filteredZones.length === 0) return true
  return props.filteredZones.includes(zone)
}

const activeDashboard = ref<string>('bar')
const barChartRef = ref<HTMLCanvasElement | null>(null)
const lineChartRef = ref<HTMLCanvasElement | null>(null)
const currentZoneIndex = ref<number>(0)
const showComparisonModal = ref<boolean>(false)

let barChartInstance: Chart | null = null
let lineChartInstance: Chart | null = null

const zonesData = ref([
  {
    zone: 'Sul',
    corridors: [
      { name: 'Av. Cidade Jardim', vehicles: 980, speed: 35 },
      { name: 'Av. Andrômeda', vehicles: 850, speed: 38 },
      { name: 'R. Bacabal', vehicles: 720, speed: 40 }
    ]
  },
  {
    zone: 'Norte',
    corridors: [
      { name: 'Via Norte', vehicles: 1150, speed: 45 },
      { name: 'Rod. Monteiro Lobato (SP-50)', vehicles: 1300, speed: 60 },
      { name: 'Via Jaguari', vehicles: 890, speed: 50 }
    ]
  },
  {
    zone: 'Leste',
    corridors: [
      { name: 'Av. Juscelino Kubitschek (JK)', vehicles: 1400, speed: 32 },
      { name: 'Av. Pedro Álvares Cabral', vehicles: 1050, speed: 35 },
      { name: 'R. José Cobra', vehicles: 760, speed: 38 }
    ]
  },
  {
    zone: 'Oeste',
    corridors: [
      { name: 'Av. Lineu de Moura', vehicles: 1100, speed: 36 },
      { name: 'Av. Cassiano Ricardo', vehicles: 1250, speed: 28 },
      { name: 'Benedito Matarazzo', vehicles: 820, speed: 40 }
    ]
  },
  {
    zone: 'Centro',
    corridors: [
      { name: 'Av. Anchieta', vehicles: 1350, speed: 25 },
      { name: 'Av. Nove de Julho', vehicles: 1200, speed: 30 },
      { name: "Av. Nelson D'Ávila", vehicles: 1080, speed: 28 }
    ]
  },
  {
    zone: 'Sudeste',
    corridors: [
      { name: 'Via Cambuí', vehicles: 950, speed: 42 },
      { name: 'João Rodolfo Castelli', vehicles: 780, speed: 45 },
      { name: 'Rod. dos Tamoios (SP-099)', vehicles: 1450, speed: 70 }
    ]
  }
])

const corridorData = ref(zonesData.value[0].corridors)

const availableZonesCount = computed(() => {
  if (props.filteredZones.length === 0) return zonesData.value.length
  return zonesData.value.filter(z => props.filteredZones.includes(z.zone)).length
})

onMounted(() => {
  if (props.filteredZones.length > 0) {
    const firstAvailableIndex = zonesData.value.findIndex(z => isZoneAvailable(z.zone))
    if (firstAvailableIndex !== -1) {
      currentZoneIndex.value = firstAvailableIndex
      corridorData.value = zonesData.value[firstAvailableIndex].corridors
    }
  }
  createBarChart()
})

function switchDashboard(type: string) {
  activeDashboard.value = type
  setTimeout(() => {
    if (type === 'bar') {
      createBarChart()
    } else {
      createLineChart()
    }
  }, 100)
}

function closeDashboard() {
  if (barChartInstance) barChartInstance.destroy()
  if (lineChartInstance) lineChartInstance.destroy()
  emit('close')
}

function nextZone() {
  let nextIndex = (currentZoneIndex.value + 1) % zonesData.value.length
  
  while (!isZoneAvailable(zonesData.value[nextIndex].zone) && nextIndex !== currentZoneIndex.value) {
    nextIndex = (nextIndex + 1) % zonesData.value.length
  }
  
  if (isZoneAvailable(zonesData.value[nextIndex].zone)) {
    currentZoneIndex.value = nextIndex
    updateCurrentZoneData()
  }
}

function prevZone() {
  let prevIndex = (currentZoneIndex.value - 1 + zonesData.value.length) % zonesData.value.length
  
  while (!isZoneAvailable(zonesData.value[prevIndex].zone) && prevIndex !== currentZoneIndex.value) {
    prevIndex = (prevIndex - 1 + zonesData.value.length) % zonesData.value.length
  }
  
  if (isZoneAvailable(zonesData.value[prevIndex].zone)) {
    currentZoneIndex.value = prevIndex
    updateCurrentZoneData()
  }
}

function updateCurrentZoneData() {
  corridorData.value = zonesData.value[currentZoneIndex.value].corridors
  createBarChart()
}

function openComparisonModal() {
  showComparisonModal.value = true
}

function closeComparisonModal() {
  showComparisonModal.value = false
}

const getChartData = (): number[] => {
  return corridorData.value.map(c => c.vehicles)
}

const getChartLabels = (): string[] => {
  return corridorData.value.map(c => c.name.replace(/\s/g, '\n'))
}

const getLineChartData = () => {
  const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00']
  
  const zonesTimeData = {
    'Sul': [120, 80, 150, 350, 680, 820, 750, 900, 950, 1100, 850, 600, 120],
    'Norte': [150, 100, 200, 450, 800, 950, 850, 1000, 1150, 1300, 950, 700, 150],
    'Leste': [180, 120, 250, 500, 900, 1100, 950, 1150, 1300, 1400, 1000, 750, 180],
    'Oeste': [140, 90, 180, 400, 750, 900, 800, 1050, 1150, 1250, 900, 650, 140],
    'Centro': [200, 150, 300, 600, 1000, 1200, 1100, 1250, 1300, 1350, 1050, 800, 200],
    'Sudeste': [130, 85, 170, 380, 700, 850, 750, 950, 1100, 1200, 850, 600, 130]
  }

  return { hours, zonesTimeData }
}

const createBarChart = () => {
  if (barChartRef.value) {
    if (barChartInstance) barChartInstance.destroy()

    const data = getChartData()
    const labels = getChartLabels()

    barChartInstance = new Chart(barChartRef.value, {
      type: 'bar',
      data: {
        labels,
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

    const { hours, zonesTimeData } = getLineChartData()
    
    const colors = [
      { border: '#00c853'},    
      { border: '#2196f3'},  
      { border: '#ff9800'},  
      { border: '#e91e63'},  
      { border: '#9c27b0'},  
      { border: '#00bcd4'}   
    ]

    const datasets = Object.entries(zonesTimeData)
      .filter(([zone]) => props.filteredZones.length === 0 || props.filteredZones.includes(zone))
      .map(([zone, data], index) => ({
        label: `Zona ${zone}`,
        data: data,
        borderColor: colors[index % colors.length].border,
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: colors[index % colors.length].border,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }))

    lineChartInstance = new Chart(lineChartRef.value, {
      type: 'line',
      data: {
        labels: hours,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: { 
          legend: { 
            display: true,
            position: 'top',
            labels: {
              font: { size: 13, weight: 600 },
              color: '#4d4d4d',
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y} veículos/hora`
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 1500,
            ticks: { 
              stepSize: 300, 
              font: { size: 12 }, 
              color: '#7a7a7a',
              callback: function(value) {
                return value + ' veíc.'
              }
            },
            grid: { color: '#e0e0e0' }
          },
          x: {
            ticks: { 
              font: { size: 12, weight: 500 }, 
              color: '#4d4d4d' 
            },
            grid: { display: false }
          }
        }
      }
    })
  }
}
</script>

<template>
  <div class="modal-overlay" @click="closeDashboard">
    <div class="modal-content" @click.stop>
      <button class="close-modal" @click="closeDashboard">×</button>

      <div class="dash-view">
        <div class="dashboard-tabs">
          <button
            :class="['tab-button', { active: activeDashboard === 'bar' }]"
            @click="switchDashboard('bar')"
          >
            Dashboard dos Corredores Principais
          </button>
          <button
            :class="['tab-button', { active: activeDashboard === 'line' }]"
            @click="switchDashboard('line')"
          >
            Evolução do Tráfego ao Longo do Dia
          </button>
        </div>

        <div v-if="activeDashboard === 'bar'" class="dashboard-content">
          <div class="zone-carousel">
            <button class="carousel-btn prev" @click="prevZone" :disabled="filteredZones.length === 1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            
            <div class="zone-display">
              <div class="zone-icon-wrapper">
                <div class="zone-icon-circle">📍</div>
              </div>
              <h2>Zona {{ zonesData[currentZoneIndex].zone }}</h2>
            </div>
            
            <button class="carousel-btn next" @click="nextZone" :disabled="filteredZones.length === 1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <button class="compare-zones-btn" @click="openComparisonModal">
            🔄 Comparar Zonas
          </button>

          <div class="corridor-cards">
            <CorridorCard
              v-for="corridor in corridorData"
              :key="corridor.name"
              :name="corridor.name"
              :vehicles="corridor.vehicles"
              :speed="corridor.speed"
            />
          </div>

          <div class="chart-section">
            <h2>Comparativo de Fluxo</h2>
            <div class="chart-container">
              <canvas ref="barChartRef"></canvas>
            </div>
          </div>
        </div>

        <div v-if="activeDashboard === 'line'" class="dashboard-content">
          <div class="chart-section">
            <h2>Evolução do Tráfego ao Longo do Dia</h2>
            <p class="chart-description">
              Comparação do fluxo de veículos por horário em todas as zonas
            </p>
            <div class="chart-container chart-container-large">
              <canvas ref="lineChartRef"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ComparisonZones
      v-if="showComparisonModal"
      :zones-data="zonesData"
      :filtered-zones="filteredZones"
      @close="closeComparisonModal"
    />
  </div>
</template>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 2000;
}

.modal-content {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: calc(100% - 650px);
  background: white;
  overflow-y: auto;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
  animation: slideInLeft 0.3s ease;

  @keyframes slideInLeft {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  .close-modal {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: #dc2626;
    color: white;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    transition: 0.2s;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: #b91c1c;
      transform: scale(1.1);
    }
  }
}

.dash-view {
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  .dashboard-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 0;

    .tab-button {
      background: transparent;
      border: none;
      padding: 1rem 2rem;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      color: #7a7a7a;
      border-bottom: 3px solid transparent;
      transition: all 0.3s ease;
      position: relative;
      bottom: -2px;

      &:hover {
        color: #4d4d4d;
        background: #f9fafb;
      }

      &.active {
        color: #00c853;
        border-bottom-color: #00c853;
        background: #f0fdf4;
      }
    }
  }

  .dashboard-content {
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .zone-carousel {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3rem;
    margin-bottom: 2rem;
    padding: 2.5rem;
    background: linear-gradient(135deg, #00c853 0%, #00963e 100%);
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 200, 83, 0.25);
    position: relative;
    overflow: hidden;

    .zone-display {
      order: 0;
      text-align: center;
      min-width: 320px;
      position: relative;
      z-index: 1;

      .zone-icon-wrapper {
        margin-bottom: 1rem;
        display: flex;
        justify-content: center;

        .zone-icon-circle {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          border: 3px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
      }

      h2 {
        font-size: 2.25rem;
        font-weight: 800;
        color: white;
        margin: 0 0 1rem 0;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        letter-spacing: 0.5px;
      }
    }

    .carousel-btn {
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(10px);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.4);
      width: 60px;
      height: 60px;
      border-radius: 80%;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      position: relative;
      z-index: 1;

      svg {
        transition: transform 0.3s ease;
      }

      &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.35);
        border-color: rgba(255, 255, 255, 0.6);
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);

        svg {
          transform: scale(1.1);
        }
      }

      &:active:not(:disabled) {
        transform: scale(0.95);
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }

  .compare-zones-btn {
    background: linear-gradient(135deg, #ffd60a 0%, #e6b800 100%);
    color: #4d4d4d;
    border: none;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(255, 214, 10, 0.4);
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(255, 214, 10, 0.5);
      background: linear-gradient(135deg, #ffe54d 0%, #ffd60a 100%);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .corridor-cards {
    display: flex;
    gap: 20px;
    margin-bottom: 40px;
  }

  .chart-section {
    margin-bottom: 40px;

    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #4d4d4d;
      margin-bottom: 10px;
    }

    .chart-description {
      font-size: 0.95rem;
      color: #7a7a7a;
      margin-bottom: 20px;

      .filter-indicator {
        display: inline-block;
        background: #e0f2fe;
        color: #0369a1;
        padding: 0.25rem 0.75rem;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 600;
        margin-left: 0.5rem;
      }
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

      &.chart-container-large {
        height: 500px;
      }
    }
  }
}

@media (max-width: 768px) {
  .modal-content {
    width: 100% !important;
  }

  .corridor-cards {
    flex-direction: column;
  }

  .zone-carousel {
    flex-direction: column;
    gap: 1rem;

    .carousel-btn {
      &.prev {
        order: -1;
      }
      &.next {
        order: 1;
      }
    }

    .zone-display {
      h2 {
        font-size: 1.5rem;
      }
    }
  }
}
</style>
