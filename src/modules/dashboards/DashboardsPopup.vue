<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import CorridorCard from './CorridorCard.vue'
import ComparisonZones from './components/ComparisonZones.vue'
import { getAllRoadsDataForDate, getAllRoadsDataForRange, getVehiclesPerHourForRoad } from './service/dashboardService'
import type { ZoneData, Corridor } from './types/dashboardsTypes'
import { convertDateToBRFormat } from '@/utils/dateUtils'

Chart.register(...registerables)

const props = defineProps<{ filteredZones: string[]; startDate?: string; endDate?: string }>()
const emit = defineEmits(['close'])

const activeDashboard = ref('bar')
const barChartRef = ref<HTMLCanvasElement | null>(null)
const lineChartRef = ref<HTMLCanvasElement | null>(null)
const currentZoneIndex = ref(0)
const showComparisonModal = ref(false)
const errorMessage = ref('')

let barChartInstance: Chart | null = null
let lineChartInstance: Chart | null = null

const zonesData = ref<ZoneData[]>([
  { zone: 'Centro', regionId: 1, corridors: [] },
  { zone: 'Norte', regionId: 2, corridors: [] },
  { zone: 'Sul', regionId: 3, corridors: [] },
  { zone: 'Leste', regionId: 4, corridors: [] },
  { zone: 'Oeste', regionId: 5, corridors: [] },
  { zone: 'Sudeste', regionId: 6, corridors: [] },
])

const corridorData = ref<Corridor[]>([])

const isZoneAvailable = (zone: string) => props.filteredZones.length === 0 || props.filteredZones.includes(zone)

const getDateRange = () => {
  if (props.startDate && props.endDate) {
    const start = props.startDate.substring(0, 10)
    const end = props.endDate.substring(0, 10)
    return { start, end }
  }
  if (props.startDate) {
    const d = props.startDate.substring(0, 10)
    return { start: d, end: d }
  }
  const today = new Date().toISOString().split('T')[0]
  return { start: today, end: today }
}

const getDateTimeRange = () => {
  if (props.startDate && props.endDate) return { start: props.startDate, end: props.endDate }
  const target = props.startDate || new Date().toISOString()
  const date = new Date(target)
  return {
    start: new Date(date.setHours(0, 0, 0, 0)).toISOString(),
    end: new Date(date.setHours(23, 59, 59, 999)).toISOString(),
  }
}

async function loadZonesData() {
  errorMessage.value = ''
  try {
    const { start, end } = getDateRange()
    const promises = zonesData.value.map(async (zone) => {
      try {
        const response =
          start === end
            ? await getAllRoadsDataForDate(zone.regionId, start)
            : await getAllRoadsDataForRange(zone.regionId, start, end)
        let dataArray: any[] = []
        if (Array.isArray(response.data)) dataArray = response.data

        if (!dataArray.length) return { ...zone, corridors: [] }

        const corridors: Corridor[] = dataArray
          .map((r) => ({
            id: r.roadId,
            name: r.roadName || `Via ${r.roadId}`,
            vehicles: r.totalCount || 0,
            speed: r.hours?.length ? r.hours.reduce((s: number, h: any) => s + (h.avgSpeedKmh || 0), 0) / r.hours.length : 0,
          }))
          .sort((a, b) => b.vehicles - a.vehicles)
          .slice(0, 3)

        return { ...zone, corridors }
      } catch {
        return { ...zone, corridors: [] }
      }
    })

    zonesData.value = await Promise.all(promises)
    if (!zonesData.value.some((z) => z.corridors.length)) {
      const { start, end } = getDateRange()
      errorMessage.value = `Nenhum dado encontrado para o período de ${convertDateToBRFormat(start)} a ${convertDateToBRFormat(end)}. Usando dados de exemplo.`
      loadMockData()
    } else updateCurrentZoneData()
  } catch {
    errorMessage.value = 'Erro ao carregar dados. Usando dados de exemplo.'
    loadMockData()
  }
}

function loadMockData() {
  zonesData.value = [
    {
      zone: 'Centro',
      regionId: 1,
      corridors: [
        { id: 13, name: 'Av. Anchieta', vehicles: 1350, speed: 25 },
        { id: 14, name: 'Av. Nove de Julho', vehicles: 1200, speed: 30 },
        { id: 15, name: "Av. Nelson D'Ávila", vehicles: 1080, speed: 28 },
      ],
    },
    {
      zone: 'Norte',
      regionId: 2,
      corridors: [
        { id: 4, name: 'Via Norte', vehicles: 1150, speed: 45 },
        { id: 5, name: 'Rod. Monteiro Lobato', vehicles: 1300, speed: 60 },
        { id: 6, name: 'Via Jaguari', vehicles: 890, speed: 50 },
      ],
    },
    {
      zone: 'Sul',
      regionId: 3,
      corridors: [
        { id: 1, name: 'Av. Cidade Jardim', vehicles: 980, speed: 35 },
        { id: 2, name: 'Av. Andrômeda', vehicles: 850, speed: 38 },
        { id: 3, name: 'R. Bacabal', vehicles: 720, speed: 40 },
      ],
    },
    {
      zone: 'Leste',
      regionId: 4,
      corridors: [
        { id: 7, name: 'Av. JK', vehicles: 1400, speed: 32 },
        { id: 8, name: 'Av. Pedro Álvares', vehicles: 1050, speed: 35 },
        { id: 9, name: 'R. José Cobra', vehicles: 760, speed: 38 },
      ],
    },
    {
      zone: 'Oeste',
      regionId: 5,
      corridors: [
        { id: 10, name: 'Av. Lineu de Moura', vehicles: 1100, speed: 36 },
        { id: 11, name: 'Av. Cassiano Ricardo', vehicles: 1250, speed: 28 },
        { id: 12, name: 'Benedito Matarazzo', vehicles: 820, speed: 40 },
      ],
    },
    {
      zone: 'Sudeste',
      regionId: 6,
      corridors: [
        { id: 16, name: 'Via Cambuí', vehicles: 950, speed: 42 },
        { id: 17, name: 'João R. Castelli', vehicles: 780, speed: 45 },
        { id: 18, name: 'Rod. Tamoios', vehicles: 1450, speed: 70 },
      ],
    },
  ]
  updateCurrentZoneData()
}

async function loadHourlyDataForAllZones() {
  try {
    const { start, end } = getDateTimeRange()
    const promises = zonesData.value
      .filter((z) => isZoneAvailable(z.zone) && z.corridors.length)
      .map(async (zone) => {
        try {
          const response = await getVehiclesPerHourForRoad({
            regionId: zone.regionId,
            roadId: zone.corridors[0].id,
            start,
            end,
          })
          if (!response.data?.length) return { zone: zone.zone, data: Array(13).fill(0) }
          const hourlyData = Array(13).fill(0)
          response.data.forEach((item) => {
            const idx = Math.floor(new Date(item.hour).getHours() / 2)
            hourlyData[idx] += item.vehicleCount
          })
          return { zone: zone.zone, data: hourlyData }
        } catch {
          return { zone: zone.zone, data: Array(13).fill(0) }
        }
      })

    const results = await Promise.all(promises)
    const zonesTimeData: Record<string, number[]> = {}
    results.forEach((r) => (zonesTimeData[r.zone] = r.data))

    return Object.values(zonesTimeData).some((d) => d.some((v) => v > 0)) ? zonesTimeData : getMockHourlyData()
  } catch {
    return getMockHourlyData()
  }
}

const getMockHourlyData = () => ({
  Centro: [200, 150, 300, 600, 1000, 1200, 1100, 1250, 1300, 1350, 1050, 800, 200],
  Norte: [150, 100, 200, 450, 800, 950, 850, 1000, 1150, 1300, 950, 700, 150],
  Sul: [120, 80, 150, 350, 680, 820, 750, 900, 950, 1100, 850, 600, 120],
  Leste: [180, 120, 250, 500, 900, 1100, 950, 1150, 1300, 1400, 1000, 750, 180],
  Oeste: [140, 90, 180, 400, 750, 900, 800, 1050, 1150, 1250, 900, 650, 140],
  Sudeste: [130, 85, 170, 380, 700, 850, 750, 950, 1100, 1200, 850, 600, 130],
})

onMounted(() => {
  loadZonesData()
  if (props.filteredZones.length) {
    const idx = zonesData.value.findIndex((z) => isZoneAvailable(z.zone))
    if (idx !== -1) currentZoneIndex.value = idx
  }
})

watch([() => props.startDate, () => props.endDate], () => {
  loadZonesData()
  if (activeDashboard.value === 'line') createLineChart()
})

watch(activeDashboard, async (newDash) => {
  if (newDash === 'line') await createLineChart()
})

const switchDashboard = (type: string) => {
  activeDashboard.value = type
  setTimeout(() => (type === 'bar' ? createBarChart() : createLineChart()), 100)
}

const closeDashboard = () => {
  if (barChartInstance) barChartInstance.destroy()
  if (lineChartInstance) lineChartInstance.destroy()
  emit('close')
}

const navigateZone = (direction: number) => {
  let idx = (currentZoneIndex.value + direction + zonesData.value.length) % zonesData.value.length
  while (!isZoneAvailable(zonesData.value[idx].zone) && idx !== currentZoneIndex.value) {
    idx = (idx + direction + zonesData.value.length) % zonesData.value.length
  }
  if (isZoneAvailable(zonesData.value[idx].zone)) {
    currentZoneIndex.value = idx
    updateCurrentZoneData()
  }
}

const updateCurrentZoneData = () => {
  corridorData.value = zonesData.value[currentZoneIndex.value].corridors
  createBarChart()
}

const createBarChart = () => {
  if (!barChartRef.value) return
  if (barChartInstance) barChartInstance.destroy()

  const data = corridorData.value.map((c) => c.vehicles)
  const labels = corridorData.value.map((c) => c.name.replace(/\s/g, '\n'))
  const maxValue = Math.max(...data, 1500)
  const chartMax = Math.ceil((maxValue * 1.2) / 500) * 500

  barChartInstance = new Chart(barChartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Veículos/dia',
          data,
          backgroundColor: '#00c853',
          borderColor: '#00963e',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, title: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          max: chartMax,
          ticks: { stepSize: 500, font: { size: 12 }, color: '#7a7a7a' },
          grid: { color: '#e0e0e0' },
        },
        x: { ticks: { font: { size: 11 }, maxRotation: 0, color: '#7a7a7a' }, grid: { display: false } },
      },
    },
  })
}

const createLineChart = async () => {
  if (!lineChartRef.value) return
  if (lineChartInstance) lineChartInstance.destroy()

  const hours = [
    '00:00',
    '02:00',
    '04:00',
    '06:00',
    '08:00',
    '10:00',
    '12:00',
    '14:00',
    '16:00',
    '18:00',
    '20:00',
    '22:00',
    '00:00',
  ]
  const zonesTimeData = await loadHourlyDataForAllZones()
  const allValues = Object.values(zonesTimeData).flat()
  const maxValue = Math.max(...allValues, 1500)
  const chartMax = Math.ceil((maxValue * 1.2) / 500) * 500
  const colors = ['#00c853', '#2196f3', '#ff9800', '#e91e63', '#9c27b0', '#00bcd4']

  const datasets = Object.entries(zonesTimeData)
    .filter(([zone]) => !props.filteredZones.length || props.filteredZones.includes(zone))
    .map(([zone, data], i) => ({
      label: `Zona ${zone}`,
      data,
      borderColor: colors[i % colors.length],
      borderWidth: 3,
      tension: 0.4,
      pointBackgroundColor: colors[i % colors.length],
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
    }))

  lineChartInstance = new Chart(lineChartRef.value, {
    type: 'line',
    data: { labels: hours, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: { size: 13, weight: 600 },
            color: '#4d4d4d',
            padding: 15,
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 13 },
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} veículos` },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: chartMax,
          ticks: {
            stepSize: Math.ceil(chartMax / 5 / 100) * 100,
            font: { size: 12 },
            color: '#7a7a7a',
            callback: (v) => v + ' veíc.',
          },
          grid: { color: '#e0e0e0' },
        },
        x: { ticks: { font: { size: 12, weight: 500 }, color: '#4d4d4d' }, grid: { display: false } },
      },
    },
  })
}

const filterInfo = computed(() => {
  const { start, end } = getDateRange()
  const format = (d: string) => {
    const [year, month, day] = d.split('-')
    return `${day}/${month}/${year}`
  }
  return start === end ? `Dados de ${format(start)}` : `Dados de ${format(start)} até ${format(end)}`
})
</script>

<template>
  <div class="modal-overlay" @click="closeDashboard">
    <div class="modal-content" @click.stop>
      <button class="close-modal" @click="closeDashboard">×</button>

      <div class="dash-view">
        <div class="dashboard-tabs">
          <button :class="['tab-button', { active: activeDashboard === 'bar' }]" @click="switchDashboard('bar')">
            Dashboard dos Corredores Principais
          </button>
          <button :class="['tab-button', { active: activeDashboard === 'line' }]" @click="switchDashboard('line')">
            Evolução do Tráfego ao Longo do Dia
          </button>
        </div>

        <div v-if="errorMessage" class="error-banner">⚠️ {{ errorMessage }}</div>
        <div v-if="startDate || endDate" class="filter-info-badge">📅 {{ filterInfo }}</div>

        <div v-if="activeDashboard === 'bar'" class="dashboard-content">
          <div class="zone-carousel">
            <button class="carousel-btn prev" @click="navigateZone(-1)" :disabled="filteredZones.length === 1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <div class="zone-display">
              <div class="zone-icon-wrapper"><div class="zone-icon-circle">📍</div></div>
              <h2>Zona {{ zonesData[currentZoneIndex].zone }}</h2>
            </div>
            <button class="carousel-btn next" @click="navigateZone(1)" :disabled="filteredZones.length === 1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>

          <button class="compare-zones-btn" @click="showComparisonModal = true">🔄 Comparar Zonas</button>

          <div v-if="!corridorData.length" class="no-data-message">📊 Nenhum dado disponível para esta zona</div>
          <div v-else class="corridor-cards">
            <CorridorCard
              v-for="c in corridorData"
              :key="c.id"
              :name="c.name"
              :vehicles="c.vehicles"
              :speed="c.speed"
            />
          </div>

          <div class="chart-section">
            <h2>Comparativo de Fluxo</h2>
            <div class="chart-container"><canvas ref="barChartRef"></canvas></div>
          </div>
        </div>

        <div v-if="activeDashboard === 'line'" class="dashboard-content">
          <div class="chart-section">
            <h2>Evolução do Tráfego ao Longo do Dia</h2>
            <p class="chart-description">Comparação do fluxo de veículos por horário em todas as zonas</p>
            <div class="chart-container chart-container-large"><canvas ref="lineChartRef"></canvas></div>
          </div>
        </div>
      </div>
    </div>

    <ComparisonZones
      v-if="showComparisonModal"
      :zones-data="zonesData"
      :filtered-zones="filteredZones"
      @close="showComparisonModal = false"
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
  animation: slideInLeft 0.3s ease;

  @keyframes slideInLeft {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
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
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
  z-index: 10;

  &:hover {
    background: #b91c1c;
    transform: scale(1.1);
  }
}

.filter-info-badge {
  position: sticky;
  top: 0;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  z-index: 5;
}

.dash-view {
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.dashboard-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
}

.tab-button {
  background: transparent;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  color: #7a7a7a;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
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

.dashboard-content {
  animation: fadeIn 0.3s;
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
}

.zone-display {
  text-align: center;
  min-width: 320px;
  z-index: 1;

  h2 {
    font-size: 2.25rem;
    font-weight: 800;
    color: white;
    margin: 0 0 1rem 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    letter-spacing: 0.5px;
  }
}

.zone-icon-wrapper {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

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

.carousel-btn {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.4);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  z-index: 1;

  svg {
    transition: transform 0.3s;
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

.compare-zones-btn {
  background: linear-gradient(135deg, #ffd60a 0%, #e6b800 100%);
  color: #4d4d4d;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
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
  gap: 15px;
  margin-bottom: 40px;
  flex-wrap: nowrap;
  overflow-x: auto;

  > * {
    flex: 1;
    min-width: 0;
    max-width: calc(33.333% - 10px);
  }
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
  }
}

.chart-container {
  background: #ffffff;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  height: 400px;

  canvas {
    max-height: 100%;
  }

  &.chart-container-large {
    height: 500px;
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

    .zone-display h2 {
      font-size: 1.5rem;
    }
  }
}

.error-banner {
  background: #fff3cd;
  color: #856404;
  padding: 1rem;
  margin: 1rem;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
  font-weight: 500;
}

.no-data-message {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #7a7a7a;
  background: #f9fafb;
  border-radius: 12px;
  margin: 2rem 0;
}
</style>
