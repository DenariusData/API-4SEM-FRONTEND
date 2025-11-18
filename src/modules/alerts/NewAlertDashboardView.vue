<template>
  <div class="zone-dashboard">

    <h2 class="title">Dashboard da {{ selectedRegion?.name || 'Zona' }}</h2>

    <div v-if="errorMessage" class="error-banner">
      <span class="error-icon">⚠️</span>
      <span class="error-text">{{ errorMessage }}</span>
      <button @click="errorMessage = ''" class="error-close">✕</button>
    </div>

    <section class="map-section">
      <div class="map-container">

        <div class="legend-left">
          <div
            v-for="metric in leftMetrics"
            :key="metric.id"
            class="legend-item"
            :class="`nivel-${metric.nivel}`"
          >
            <div class="legend-title">{{ metric.name }}</div>
            <div class="legend-level">Nível {{ metric.nivel }}</div>
          </div>
        </div>

        <div class="map-wrapper">
          <div ref="mapContainer" class="leaflet-map"></div>
        </div>

        <div class="legend-right">
          <div
            v-for="metric in rightMetrics"
            :key="metric.id"
            class="legend-item"
            :class="`nivel-${metric.nivel}`"
          >
            <div class="legend-title">{{ metric.name }}</div>
            <div class="legend-level">Nível {{ metric.nivel }}</div>
          </div>
        </div>
      </div>

      <div class="color-legend">
        <div class="color-item">
          <span class="color-box excelente"></span>
          <span>Excelente</span>
        </div>
        <div class="color-item">
          <span class="color-box bom"></span>
          <span>Bom</span>
        </div>
        <div class="color-item">
          <span class="color-box medio"></span>
          <span>Médio</span>
        </div>
        <div class="color-item">
          <span class="color-box ruim"></span>
          <span>Ruim</span>
        </div>
        <div class="color-item">
          <span class="color-box pessimo"></span>
          <span>Péssimo</span>
        </div>
      </div>
    </section>

    <section class="filters-section">
      <div class="filters">

        <div class="filter-item">
          <label>Filtrar por tipo:</label>
          <select v-model="selectedCriterion" @change="fetchAlerts">
            <option value="">Todos os tipos</option>
            <option
              v-for="criterion in criteria"
              :key="criterion.id"
              :value="criterion.id"
            >
              {{ criterion.name }}
            </option>
          </select>
        </div>

        <div class="filter-item">
          <label>Filtrar por nível:</label>
          <select v-model="selectedLevel">
            <option value="">Todos os níveis</option>
            <option v-for="level in levels" :key="level.value" :value="level.value">
              Nível {{ level.value }}
            </option>
          </select>
        </div>
      </div>
    </section>

    <section class="table-section">
      <h3>Alertas por Criticidade ({{ filteredAlerts.length }})</h3>

      <table class="alerts-table" v-if="filteredAlerts.length > 0">
        <thead>
          <tr>
            <th>Alerta</th>
            <th>Detalhes</th>
            <th>Criado em</th>
            <th
              @click="toggleSort"
              class="sortable"
              title="Ordenar por criticidade"
              :aria-label="`Ordenar por criticidade ${sortDirection === 'desc' ? 'decrescente' : 'crescente'}`"
            >
              Criticidade
              <span>{{ sortDirection === 'desc' ? '▼' : '▲' }}</span>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in filteredAlerts" :key="item.id">
            <td>{{ item.criterionName || 'Alerta' }}</td>
            <td class="message-cell">
              <span
                class="message-truncated"
                :title="item.message"
                @click="toggleMessageExpand(item.id)"
              >
                {{ isExpanded(item.id) ? item.message : truncateMessage(item.message) }}
              </span>
              <button
                v-if="item.message && item.message.length > 80"
                @click="toggleMessageExpand(item.id)"
                class="expand-btn"
                :aria-label="isExpanded(item.id) ? 'Recolher mensagem' : 'Expandir mensagem'"
              >
                {{ isExpanded(item.id) ? '▲' : '▼' }}
              </button>
            </td>
            <td class="date-cell">
              {{ formatFullDate(item.createdAt) }}
            </td>
            <td>
              <span class="badge" :class="`badge-nivel-${item.level}`">
                Nível {{ item.level }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="no-data">
        {{ loading ? 'Carregando...' : `Nenhum alerta encontrado${selectedLevel ? ' para este nível de criticidade' : ''}.` }}
      </p>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import sjcGeojson from '@/utils/sjcGeojson.json'
import { getRegionsLevel } from '@/modules/home/services/mapService'
import { getRegions } from '@/modules/persons/services/regionService'
import alerts from '@/modules/alerts/services/alertServices'

const mapContainer = ref<HTMLDivElement | null>(null)
const map = ref<L.Map | null>(null)
const geoJsonLayer = ref<L.GeoJSON | null>(null)
const regionNameToLevelMap = ref<Map<string, number>>(new Map())
const selectedRegion = ref<{ name: string; level: number } | null>(null)

const criteria = ref<any[]>([])
const zoneMetrics = ref<any[]>([])

const levelColorMap: Record<number, string> = {
  1: '#10b981',
  2: '#7af957',
  3: '#edef56',
  4: '#f59e0b',
  5: '#ef4444',
}

const levels = [
  { value: 1 },
  { value: 2 },
  { value: 3 },
  { value: 4 },
  { value: 5 }
]

let regionId = 1
const selectedCriterion = ref('')
const selectedLevel = ref('')
const sortDirection = ref<'asc' | 'desc'>('desc')
const allAlerts = ref<any[]>([])
const expandedMessages = ref<Set<number>>(new Set())
const loading = ref(false)
const errorMessage = ref('')

const leftMetrics = computed(() => {
  const half = Math.ceil(zoneMetrics.value.length / 2)
  return zoneMetrics.value.slice(0, half)
})

const rightMetrics = computed(() => {
  const half = Math.ceil(zoneMetrics.value.length / 2)
  return zoneMetrics.value.slice(half)
})

const filteredAlerts = computed(() => {
  let alerts = [...allAlerts.value]

  if (selectedLevel.value) {
    alerts = alerts.filter(alert => alert.level === Number(selectedLevel.value))
  }

  alerts.sort((a, b) =>
    sortDirection.value === 'desc'
      ? b.level - a.level
      : a.level - b.level
  )

  return alerts
})

function getLevelColor(zoneName: string): string {
  const level = regionNameToLevelMap.value.get(zoneName)
  if (!level) return '#3388ff'
  return levelColorMap[level] || '#3388ff'
}

function initializeMap(): void {
  if (!mapContainer.value) return

  map.value = L.map(mapContainer.value, {
    zoomControl: false,
    attributionControl: false
  }).setView([-23.2, -45.9], 11)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
  }).addTo(map.value as L.Map)
}

async function fetchCriteria() {
  try {
    const response = await alerts.getCriteria()
    criteria.value = response.data || []

    zoneMetrics.value = criteria.value.map(criterion => ({
      id: criterion.id,
      name: criterion.name,
      description: criterion.description,
      nivel: 1
    }))
  } catch (error) {
    console.error('Erro ao carregar critérios:', error)
    errorMessage.value = 'Erro ao carregar tipos de alerta.'
  }
}

async function fetchRegionData(): Promise<void> {
  try {
    const [regionsResponse, levelsResponse] = await Promise.all([
      getRegions(),
      getRegionsLevel()
    ])

    const regionIdToNameMap = new Map<number, string>()

    const regionsList = regionsResponse?.data || regionsResponse || []
    if (Array.isArray(regionsList)) {
      regionsList.forEach((region: { id: number; name: string }) => {
        regionIdToNameMap.set(region.id, region.name)
      })
    }

    const levelsList = levelsResponse?.data || levelsResponse || []
    if (Array.isArray(levelsList)) {
      levelsList.forEach((item: { region_id: number; level: number }) => {
        const regionName = regionIdToNameMap.get(item.region_id)
        if (regionName) {
          const cleanedName = regionName.replace(/zona\s*/gi, '').trim()
          regionNameToLevelMap.value.set(cleanedName, item.level)
        }
      })
    }
  } catch (error) {
    console.error('Erro ao carregar dados das regiões:', error)
    errorMessage.value = 'Erro ao carregar dados das regiões. Tente recarregar a página.'
  }
}

function drawMap(features: any[]): void {
  if (!map.value) return

  if (geoJsonLayer.value) {
    map.value.removeLayer(geoJsonLayer.value as any)
  }

  geoJsonLayer.value = L.geoJSON(features, {
    style: (feature) => {
      const props = feature?.properties || {}
      const region = props.regiao
      const isSelected = selectedRegion.value?.name === `Zona ${region}`
      const fillColor = props.layer === 'zona'
        ? getLevelColor(region)
        : props.color || '#3388ff'

      return {
        color: isSelected ? '#0044ff' : '#333',
        weight: isSelected ? 3 : 1,
        fillColor: fillColor,
        fillOpacity: props.layer === 'municipio' ? 0.2 : 0.6,
      }
    },
    onEachFeature: (feature, layer) => {
      const props = feature?.properties || {}
      if (props.layer === 'zona') {
        layer.bindTooltip(`Zona ${props.regiao}`, { sticky: true })
        layer.on('click', () => {
          handleZoneClick(props.regiao)
        })
      }
    },
  }).addTo(map.value as L.Map)
}

async function fetchAlerts() {
  loading.value = true
  errorMessage.value = ''

  try {
    let response

    if (selectedCriterion.value) {
      response = await alerts.getTop5ByRegionAndCriterion(
        regionId,
        Number(selectedCriterion.value)
      )
    } else {
      response = await alerts.getTop5ByRegion(regionId)
    }

    const data = response?.data || response
    const list = data?.content || data || []

    allAlerts.value = list
    updateZoneMetricsFromAlerts(list)

  } catch (e) {
    console.error('Erro ao buscar alertas:', e)
    errorMessage.value = 'Erro ao buscar alertas da região. Tente novamente.'
    allAlerts.value = []
  } finally {
    loading.value = false
  }
}

function updateZoneMetricsFromAlerts(alertsList: any[]) {
  const alertsByCriterion = new Map<number, number[]>()

  alertsList.forEach((alert: any) => {
    if (alert.criterionId && alert.level) {
      if (!alertsByCriterion.has(alert.criterionId)) {
        alertsByCriterion.set(alert.criterionId, [])
      }
      alertsByCriterion.get(alert.criterionId)?.push(alert.level)
    }
  })

  zoneMetrics.value = criteria.value.map(criterion => {
    const levels = alertsByCriterion.get(criterion.id) || []
    const maxLevel = levels.length > 0 ? Math.max(...levels) : 1

    return {
      id: criterion.id,
      name: criterion.name,
      description: criterion.description,
      nivel: maxLevel
    }
  })
}

async function handleZoneClick(zoneName: string) {
  const level = regionNameToLevelMap.value.get(zoneName)

  selectedRegion.value = {
    name: `Zona ${zoneName}`,
    level: level || 0
  }

  const regionIdForZone = await getRegionIdByName(zoneName)

  if (regionIdForZone) {
    regionId = regionIdForZone
    await fetchAlerts()
  } else {
    console.error('RegionId não encontrado para zona:', zoneName)
    errorMessage.value = `Não foi possível encontrar dados para a ${zoneName}`
  }

  drawMap(sjcGeojson.features)
}

async function getRegionIdByName(zoneName: string): Promise<number | null> {
  try {
    const regionsResponse = await getRegions()
    const regionsList = regionsResponse?.data || regionsResponse || []

    if (Array.isArray(regionsList)) {
      const region = regionsList.find((r: any) => {
        const cleanName = r.name.replace(/zona\s*/gi, '').trim().toLowerCase()
        return cleanName === zoneName.toLowerCase()
      })
      return region?.id || null
    }
    return null
  } catch (error) {
    console.error('Erro ao buscar regionId:', error)
    errorMessage.value = 'Erro ao identificar a região selecionada.'
    return null
  }
}

function toggleSort() {
  sortDirection.value = sortDirection.value === 'desc' ? 'asc' : 'desc'
}

function truncateMessage(message: string): string {
  if (!message) return ''
  if (message.length <= 80) return message
  return message.substring(0, 80) + '...'
}

function toggleMessageExpand(id: number) {
  if (expandedMessages.value.has(id)) {
    expandedMessages.value.delete(id)
  } else {
    expandedMessages.value.add(id)
  }
}

function isExpanded(id: number): boolean {
  return expandedMessages.value.has(id)
}

function formatFullDate(dateString: string): string {
  if (!dateString) return 'Data não disponível'

  const date = new Date(dateString)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  initializeMap()
  await fetchCriteria()
  await fetchRegionData()
  drawMap(sjcGeojson.features)
  await fetchAlerts()
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})
</script>

<style scoped lang="scss">
.zone-dashboard {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.title {
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 24px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  animation: slideDown 0.3s ease;

  .error-icon {
    font-size: 20px;
  }

  .error-text {
    flex: 1;
    font-size: 14px;
  }

  .error-close {
    background: none;
    border: none;
    color: #c33;
    cursor: pointer;
    font-size: 18px;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background 0.2s;

    &:hover {
      background: rgba(204, 51, 51, 0.1);
    }
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.map-section {
  margin-bottom: 32px;
}

.map-container {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 16px;
}

.legend-left,
.legend-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.legend-item {
  padding: 12px 16px;
  border-radius: 8px;
  color: white;
  min-width: 200px;
  transition: all 0.3s ease;
  animation: fadeIn 0.5s ease;

  &.nivel-1 {
    background: #10b981;
  }

  &.nivel-2 {
    background: #7af957;
    color: #333;
  }

  &.nivel-3 {
    background: #edef56;
    color: #333;
  }

  &.nivel-4 {
    background: #f59e0b;
  }

  &.nivel-5 {
    background: #ef4444;
  }
}

@keyframes fadeIn {
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.legend-title {
  font-size: 11px;
  margin-bottom: 4px;
  opacity: 0.9;
}

.legend-level {
  font-size: 18px;
  font-weight: 700;
}

.map-wrapper {
  flex: 1;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  min-height: 400px;
}

.leaflet-map {
  width: 100%;
  height: 400px;
  border-radius: 12px;
}

.color-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.color-box {
  width: 40px;
  height: 16px;
  border-radius: 3px;

  &.excelente {
    background: #10b981;
  }

  &.bom {
    background: #7af957;
  }

  &.medio {
    background: #edef56;
  }

  &.ruim {
    background: #f59e0b;
  }

  &.pessimo {
    background: #ef4444;
  }
}

.filters-section {
  margin-bottom: 24px;
}

.filters {
  display: flex;
  gap: 24px;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;

  label {
    font-size: 14px;
    font-weight: 500;
  }

  select {
    padding: 8px 12px;
    border: 1px solid #d0d0d0;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    background: white;

    &:focus {
      outline: none;
      border-color: #10b981;
    }
  }
}

.table-section {
  h3 {
    margin-bottom: 16px;
    font-size: 18px;
    font-weight: 600;
  }
}

.sortable {
  cursor: pointer;
  user-select: none;

  &:hover {
    background: #f5f5f5;
  }

  span {
    margin-left: 4px;
  }
}

.alerts-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  th,
  td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }

  th {
    background: #f8f8f8;
    font-weight: 600;
    font-size: 14px;
    white-space: nowrap;
  }

  td {
    font-size: 14px;
  }

  .message-cell {
    max-width: 400px;
    position: relative;
  }

  .message-truncated {
    cursor: help;
    display: inline-block;
    max-width: calc(100% - 30px);
  }

  .expand-btn {
    background: none;
    border: none;
    color: #10b981;
    cursor: pointer;
    padding: 2px 8px;
    margin-left: 4px;
    font-size: 12px;
    vertical-align: middle;

    &:hover {
      background: #f0f0f0;
      border-radius: 4px;
    }
  }

  .date-cell {
    white-space: nowrap;
    color: #666;
    font-size: 13px;
  }

  tbody tr:hover {
    background: #f9f9f9;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
}

.no-data {
  text-align: center;
  margin-top: 24px;
  color: #999;
  font-size: 14px;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;

  &.badge-nivel-1 {
    background: #10b981;
    color: white;
  }

  &.badge-nivel-2 {
    background: #7af957;
    color: #333;
  }

  &.badge-nivel-3 {
    background: #edef56;
    color: #333;
  }

  &.badge-nivel-4 {
    background: #f59e0b;
    color: white;
  }

  &.badge-nivel-5 {
    background: #ef4444;
    color: white;
  }
}

:deep(.leaflet-interactive) {
  outline: none !important;
}

:deep(.leaflet-container) {
  background: #f5f5f5;
}
</style>
