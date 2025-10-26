<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import CorridorCard from './CorridorCard.vue'

Chart.register(...registerables)

const props = defineProps<{
  filteredZones: string[]
}>()

const emit = defineEmits(['close'])

const activeDashboard = ref<string>('bar')
const barChartRef = ref<HTMLCanvasElement | null>(null)
const lineChartRef = ref<HTMLCanvasElement | null>(null)
const selectedPeriod = ref<string>('dia-todo')

let barChartInstance: Chart | null = null
let lineChartInstance: Chart | null = null

const periods = ref([
  { label: 'Manhã', value: 'manha' },
  { label: 'Tarde', value: 'tarde' },
  { label: 'Noite', value: 'noite' },
  { label: 'Dia Todo', value: 'dia-todo' }
])

const corridorData = ref([
  { name: 'R. Bacabal', vehicles: 850, speed: 32 },
  { name: 'Av. Cassiano Ricardo', vehicles: 1200, speed: 28 },
  { name: "Av. Dr. Nélson d'Ávila", vehicles: 940, speed: 35 }
])

onMounted(() => {
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

const getChartData = (period: string): number[] => {
  const baseData: Record<string, number[]> = {
    manha: [650, 900, 720],
    tarde: [850, 1200, 940],
    noite: [450, 800, 620],
    'dia-todo': [850, 1200, 940]
  }
  return baseData[period] || baseData['dia-todo']
}

const getLineChartData = () => [
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

function updateDashboardData() {
  const data = getChartData(selectedPeriod.value)
  corridorData.value = corridorData.value.map((corridor, i) => ({
    ...corridor,
    vehicles: data[i]
  }))
  createBarChart()
}
</script>

<template>
  <div class="modal-overlay" @click="closeDashboard">
    <div class="modal-content" @click.stop>
      <button class="close-modal" @click="closeDashboard">×</button>

      <div class="dash-view">
        <div v-if="filteredZones.length > 0" class="filtered-zones-info">
          <h3>🗺️ Zonas Filtradas</h3>
          <div class="zones-list">
            <span v-for="zone in filteredZones" :key="zone" class="zone-tag">
              Zona {{ zone }}
            </span>
          </div>
        </div>
        <div v-else class="filtered-zones-info no-filter">
          <p>ℹ️ Nenhuma zona filtrada - exibindo dados de todas as zonas</p>
        </div>

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
          <div class="filters">
            <h3>Filtro</h3>
            <div class="filter-buttons">
              <button
                v-for="period in periods"
                :key="period.value"
                :class="['filter-btn', { active: selectedPeriod === period.value }]"
                @click="selectedPeriod = period.value; updateDashboardData()"
              >
                {{ period.label }}
              </button>
            </div>
          </div>

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
            <h2>Fluxo de Veículos por Horário</h2>
            <div class="chart-container">
              <canvas ref="lineChartRef"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
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
  pointer-events: none;
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

  .filtered-zones-info {
    background: linear-gradient(135deg, #00c853 0%, #00963e 100%);
    color: white;
    padding: 1.25rem;
    border-radius: 10px;
    margin-bottom: 1.5rem;
    margin-top: 3rem;
    box-shadow: 0 2px 8px rgba(0, 200, 83, 0.2);

    h3 {
      margin: 0 0 0.75rem 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .zones-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;

      .zone-tag {
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        padding: 0.4rem 0.9rem;
        border-radius: 20px;
        font-size: 0.95rem;
        font-weight: 500;
        border: 1px solid rgba(255, 255, 255, 0.3);
      }
    }

    &.no-filter {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      
      p {
        margin: 0;
        font-size: 1rem;
        font-weight: 500;
      }
    }
  }

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
}

@media (max-width: 768px) {
  .modal-content {
    width: 100% !important;
  }

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

  .filtered-zones-info {
    .zones-list {
      .zone-tag {
        font-size: 0.85rem;
        padding: 0.35rem 0.75rem;
      }
    }
  }
}
</style>
