<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import sjcGeojson from '@/utils/sjcGeojson.json'
import DashboardPopup from '@/modules/dashboards/DashboardsPopup.vue'
import MetricCards from '@/modules/home/components/MetricCards.vue'
import AlertsTable from '@/modules/home/components/AlertsTable.vue'
import { getRegions } from '@/modules/persons/services/regionService'
import { registerPeriodicTask } from '@/shared/periodicUpdater'
import { useRoleStore } from '@/modules/login/store/roleStore'
import alerts from '@/modules/alerts/services/alertServices'

import type { Criterion, ZoneMetric, Alert } from '@/modules/home/types/homeTypes'

const mapContainer = ref<HTMLDivElement | null>(null)
const map = ref<L.Map | null>(null)
const geoJsonLayer = ref<L.GeoJSON | null>(null)
const selectedZones = ref<string[]>([])
const filteredZones = ref<string[]>([])
const startDateTime = ref<string>('')
const endDateTime = ref<string>('')
const showFilters = ref<boolean>(false)
const showDashboard = ref<boolean>(false)

const activeAnimations = new Map<string, number>()
const regionNameToLevelMap = ref<Map<string, number>>(new Map())
const regionIdToNameMap = ref<Map<number, string>>(new Map())
const regionNameToIdMap = ref<Map<string, number>>(new Map())

const roleStore = useRoleStore()

const criterias = ref<Alert[]>([])
const zoneMetrics = ref<ZoneMetric[]>([])
const selectedCriterion = ref('')
const selectedLevel = ref('')
const sortDirection = ref<'asc' | 'desc'>('desc')
const allAlerts = ref<Alert[]>([])
const loading = ref(false)
const errorMessage = ref('')
const regionsLevelData = ref<{ region_id: number; level: number }[]>([])

let unregisterPeriodicTask: (() => void) | null = null

const isAgent = computed(() => roleStore.isAgente)
const canAccessFiltersAndDashboard = computed(() => 
  roleStore.isAdmin || roleStore.isGestor || roleStore.isAgente
)

const criteriaForTable = computed<Criterion[]>(() => {
  const uniqueCriteria = new Map()

  criterias.value.forEach((alert) => {
    if (alert.criterionId && !uniqueCriteria.has(alert.criterionId)) {
      uniqueCriteria.set(alert.criterionId, {
        id: alert.criterionId,
        name: alert.criterionName || 'N/A',
        description: alert.message || 'N/A',
      })
    }
  })

  return Array.from(uniqueCriteria.values())
})

const levelColorMap: Record<number, string> = {
  1: '#10b981',
  2: '#7af957',
  3: '#edef56',
  4: '#f59e0b',
  5: '#ef4444',
}

function getLevelColor(zoneName: string): string {
  const level = regionNameToLevelMap.value.get(zoneName)
  if (!level) return '#3388ff'
  return levelColorMap[level] || '#3388ff'
}

function initializeMap(): void {
  if (!mapContainer.value) return

  map.value = L.map(mapContainer.value).setView([-23.2, -45.9], 11)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors',
  }).addTo(map.value as L.Map)
}

function createLegend(): void {
  if (!map.value) return

  const legend = new L.Control({ position: 'bottomright' })
  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'legend')
    L.DomEvent.disableClickPropagation(div)

    const levels = [
      { level: 1, color: levelColorMap[1], label: 'Nível 1' },
      { level: 2, color: levelColorMap[2], label: 'Nível 2' },
      { level: 3, color: levelColorMap[3], label: 'Nível 3' },
      { level: 4, color: levelColorMap[4], label: 'Nível 4' },
      { level: 5, color: levelColorMap[5], label: 'Nível 5' },
    ]

    div.innerHTML = '<h4 style="margin: 0 0 10px 0; font-weight: bold; font-size: 14px;">Níveis de Alerta</h4>'
    levels.forEach((item) => {
      div.innerHTML += `
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <div style="width: 20px; height: 20px; background-color: ${item.color}; margin-right: 10px; border: 1px solid #333; border-radius: 3px;"></div>
          <span style="font-size: 12px;">${item.label}</span>
        </div>
      `
    })

    return div
  }
  legend.addTo(map.value)
}

async function fetchRegionData(): Promise<void> {
  try {
    const [regionsResponse, levelsResponse] = await Promise.all([
      getRegions(), 
      alerts.getRegionsLevel()
    ])

    const regionIdToNameMapLocal = new Map<number, string>()

    const regionsList = regionsResponse?.data || regionsResponse || []
    if (Array.isArray(regionsList)) {
      regionsList.forEach((region: { id: number; name: string }) => {
        regionIdToNameMapLocal.set(region.id, region.name)
        regionIdToNameMap.value.set(region.id, region.name)

        const cleanedName = region.name.replace(/zona\s*/gi, '').trim()
        regionNameToIdMap.value.set(cleanedName, region.id)
      })
    }

    const levelsList = levelsResponse?.data || levelsResponse || []
    if (Array.isArray(levelsList)) {
      regionsLevelData.value = levelsList

      levelsList.forEach((item: { region_id: number; level: number }) => {
        const regionName = regionIdToNameMapLocal.get(item.region_id)
        if (regionName) {
          const cleanedName = regionName.replace(/zona\s*/gi, '').trim()
          regionNameToLevelMap.value.set(cleanedName, item.level)
        }
      })
    }
  } catch (error) {
    console.error('Erro ao carregar dados das regiões:', error)
    errorMessage.value = 'Erro ao carregar dados das regiões.'
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
      const selected = selectedZones.value.includes(region)
      const filtered = filteredZones.value.includes(region)

      let borderColor = '#333'
      let fillColor = props.layer === 'zona' ? getLevelColor(region) : props.color || '#3388ff'

      if (selected) {
        borderColor = '#0044ff'
        fillColor = '#3399ff'
      } else if (filtered) {
        borderColor = '#008000'
        fillColor = '#33cc33'
      }

      return {
        color: borderColor,
        weight: selected || filtered ? 3 : 1,
        fillColor: fillColor,
        fillOpacity: props.layer === 'municipio' ? 0.2 : 0.6,
      }
    },
    onEachFeature: (feature, layer) => {
      const props = feature?.properties || {}

      if (props.layer === 'zona') {
        layer.bindTooltip(`Zona ${props.regiao}`, { sticky: true })
        layer.bindPopup(`
          <b>Zona ${props.regiao}</b><br>
          Domicílios (origem): ${props.domiciliosOrigem || 'N/D'}<br>
          Pessoas (origem): ${props.pessoasOrigem || 'N/D'}<br>
          Moradores/domicílio (origem): ${props.moradoresOrigem || 'N/D'}<br>
          Domicílios (est. 2025): ${props.domiciliosEst || 'N/D'}<br>
          Pessoas (est. 2025): ${props.pessoasEst || 'N/D'}<br>
          Moradores/dom. (est. 2025): ${props.moradoresEst || 'N/D'}
        `)

        layer.on('dblclick', (e) => {
          L.DomEvent.stopPropagation(e)
          if (canAccessFiltersAndDashboard.value) {
            toggleZone(props.regiao, layer)
          }
        })
      } else if (props.layer === 'municipio') {
        layer.bindPopup(`<b>${props.name}</b><br>${props.description || ''}`)
      }
    },
  }).addTo(map.value as L.Map)
}

async function fetchRegionsCriterias() {
  try {
    let regionIds = [1, 2, 3, 4, 5]

    if (filteredZones.value.length > 0) {
      regionIds = filteredZones.value
        .map((zoneName) => regionNameToIdMap.value.get(zoneName))
        .filter((id) => id !== undefined) as number[]

      if (regionIds.length === 0) {
        regionIds = [1, 2, 3, 4, 5]
      }
    }

    const response = await alerts.getRegionsAlerts(regionIds)
    criterias.value = response.data || []

    await updateZoneMetricsWithCurrentLevels()
  } catch (error) {
    console.error('Erro ao carregar critérios:', error)
    errorMessage.value = 'Erro ao carregar tipos de alerta.'
  }
}

async function fetchAlerts() {
  loading.value = true
  errorMessage.value = ''

  try {
    let regionIds = [1, 2, 3, 4, 5]

    if (filteredZones.value.length > 0) {
      regionIds = filteredZones.value
        .map((zoneName) => regionNameToIdMap.value.get(zoneName))
        .filter((id) => id !== undefined) as number[]

      if (regionIds.length === 0) {
        regionIds = [1, 2, 3, 4, 5]
      }
    }

    let criticalAlerts: Alert[] = []

    try {
      const hasDateFilter = startDateTime.value || endDateTime.value

      let response
      if (selectedCriterion.value) {
        response = await alerts.getTop5ByRegionAndCriterion(regionIds, Number(selectedCriterion.value))
      } else if (hasDateFilter) {
        response = await alerts.getTop5ByRegion(regionIds)
      } else {
        response = await alerts.getTop5ByRegion(regionIds)
      }

      const data = response?.data || response
      criticalAlerts = Array.isArray(data) ? data : (data as { content?: Alert[] })?.content || []

      criticalAlerts.sort((a, b) => {
        const levelA = a.newLevel || a.level || 0
        const levelB = b.newLevel || b.level || 0
        return levelB - levelA
      })
    } catch (error) {
      console.error(`Erro ao buscar alertas das regiões ${regionIds.join(', ')}:`, error)
      criticalAlerts = []
    }

    allAlerts.value = criticalAlerts
    updateZoneMetricsFromAlerts(criticalAlerts)
  } catch (e) {
    console.error('Erro ao buscar alertas:', e)
    errorMessage.value = 'Erro ao buscar alertas. Tente novamente.'
    allAlerts.value = []
  } finally {
    loading.value = false
  }
}

async function updateZoneMetricsWithCurrentLevels() {
  try {
    const levelsList = regionsLevelData.value
    const regionLevels = new Map<number, number>()

    if (Array.isArray(levelsList)) {
      levelsList.forEach((item: { region_id: number; level: number }) => {
        regionLevels.set(item.region_id, item.level)
      })
    }

    zoneMetrics.value = criterias.value.map((alert) => {
      return {
        id: alert.id,
        name: alert.criterionName || 'N/A',
        nivel: alert.level || 1,
        region: alert.regionName || 'N/A',
      }
    })
  } catch (error) {
    console.error('Erro ao atualizar métricas das zonas:', error)
  }
}

function updateZoneMetricsFromAlerts(alertsList: Alert[]) {
  if (!alertsList || alertsList.length === 0) {
    return
  }

  const alertsByCriterion = new Map<number, number[]>()

  alertsList.forEach((alert: Alert) => {
    const currentLevel = alert.newLevel || alert.level

    if (alert.criterionId && currentLevel) {
      if (!alertsByCriterion.has(alert.criterionId)) {
        alertsByCriterion.set(alert.criterionId, [])
      }
      alertsByCriterion.get(alert.criterionId)?.push(currentLevel)
    }
  })

  zoneMetrics.value = zoneMetrics.value.map((metric) => {
    const levels = alertsByCriterion.get(metric.id)
    if (levels && levels.length > 0) {
      const maxLevel = Math.max(...levels)
      return {
        ...metric,
        nivel: maxLevel,
      }
    }
    return metric
  })
}

onMounted(async () => {
  initializeMap()
  createLegend()

  unregisterPeriodicTask = registerPeriodicTask(async () => {
    await fetchRegionData()
    if (map.value && geoJsonLayer.value) {
      drawMap(sjcGeojson.features)
    }
  })

  await fetchRegionData()
  drawMap(sjcGeojson.features)

  if (isAgent.value) {
    await fetchRegionsCriterias()
    await fetchAlerts()
  }
})

watch(isAgent, async (newIsAgent, oldIsAgent) => {
  if (newIsAgent && !oldIsAgent) {
    await fetchRegionData()
    await fetchRegionsCriterias()
    await fetchAlerts()
  }
})

onUnmounted(() => {
  if (unregisterPeriodicTask) {
    unregisterPeriodicTask()
    unregisterPeriodicTask = null
  }
  activeAnimations.forEach(clearInterval)
  activeAnimations.clear()
})

function toggleZone(region: string, layer: any) {
  const index = selectedZones.value.indexOf(region)
  if (index >= 0) {
    selectedZones.value.splice(index, 1)
    stopAnimation(region)
  } else {
    selectedZones.value.push(region)
    startAnimation(region, layer)
  }
  drawMap(sjcGeojson.features)
}

function startAnimation(region: string, layer: L.Layer) {
  stopAnimation(region)
  if (!(layer as any).setStyle) return

  let glow = 0
  const interval = setInterval(() => {
    if (!(layer as any).setStyle) return
    const intensity = 0.5 + 0.3 * Math.sin(glow)
    ;(layer as any).setStyle({
      weight: 3 + 1.5 * intensity,
      color: `rgba(0, 68, 255, ${0.7 + 0.3 * intensity})`,
    })
    glow += 0.3
    if (glow > Math.PI * 2) glow = 0
  }, 120)
  activeAnimations.set(region, interval)
}

function stopAnimation(region: string) {
  const anim = activeAnimations.get(region)
  if (anim) {
    clearInterval(anim)
    activeAnimations.delete(region)
  }
}

function applyFilter() {
  let filtered = sjcGeojson.features
  if (selectedZones.value.length > 0) {
    filtered = sjcGeojson.features.filter((f: any) => {
      if (f.properties?.layer === 'municipio') return true
      return selectedZones.value.includes(f.properties?.regiao)
    })
  }

  filteredZones.value = [...selectedZones.value]
  selectedZones.value = []

  drawMap(filtered)
  activeAnimations.forEach(clearInterval)
  activeAnimations.clear()
  showFilters.value = false

  if (isAgent.value) {
    fetchRegionsCriterias()
    fetchAlerts()
  }
}

function clearSelection() {
  selectedZones.value = []
  filteredZones.value = []
  startDateTime.value = ''
  endDateTime.value = ''
  activeAnimations.forEach(clearInterval)
  activeAnimations.clear()
  drawMap(sjcGeojson.features)
  showFilters.value = false
  errorMessage.value = ''
}

function openDashboard() {
  showDashboard.value = true
}

function closeDashboard() {
  showDashboard.value = false
}

function toggleSort() {
  sortDirection.value = sortDirection.value === 'desc' ? 'asc' : 'desc'
}

function handleCriterionChange() {
  fetchAlerts()
}
</script>

<template>
  <div class="home-container">

    <div v-if="errorMessage" class="error-banner">
      <span class="error-icon">⚠️</span>
      <span class="error-text">{{ errorMessage }}</span>
      <button @click="errorMessage = ''" class="error-close">✕</button>
    </div>

    <div v-if="canAccessFiltersAndDashboard" class="top-bar">
      <button class="filters-button" @click="showFilters = !showFilters">
        Filtros
      </button>
      <button class="dashboard-button" @click="openDashboard">
        Dashboard's
      </button>
    </div>

    <div class="content-wrapper" :class="{ 'agent-layout': isAgent }">
      <div v-if="showFilters && canAccessFiltersAndDashboard" class="filter-dropdown">
        <div class="filter-content">
          <div class="instructions">
            ℹ️ Dê <b>dois cliques</b> em uma zona para selecioná-la
          </div>

          <div class="filter-group">
            <label for="start-datetime">Data/hora inicial</label>
            <input
              id="start-datetime"
              v-model="startDateTime"
              type="datetime-local"
              class="datetime-input"
            />
          </div>

          <div class="filter-group">
            <label for="end-datetime">Data/hora final</label>
            <input
              id="end-datetime"
              v-model="endDateTime"
              type="datetime-local"
              class="datetime-input"
            />
          </div>

          <div class="status">
            <span v-if="selectedZones.length === 0 && filteredZones.length === 0">
              Nenhuma zona selecionada
            </span>
            <span v-else-if="selectedZones.length > 0">
              Zonas (pré-seleção): {{ selectedZones.join(', ') }}
            </span>
            <span v-else>
              Zonas aplicadas: {{ filteredZones.join(', ') }}
            </span>
          </div>

          <div class="buttons">
            <button
              @click="applyFilter"
              :disabled="!selectedZones.length && !startDateTime && !endDateTime"
              class="apply-btn"
            >
              Filtrar
            </button>
            <button
              @click="clearSelection"
              :disabled="!selectedZones.length && !filteredZones.length && !startDateTime && !endDateTime"
              class="clear-btn"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      <div v-if="isAgent" class="agent-content">
        <div class="top-section">
          <div class="metrics-container">
            <MetricCards :metrics="zoneMetrics" />
          </div>

          <div ref="mapContainer" class="map map-compact"></div>
        </div>

        <div class="bottom-section">
          <AlertsTable
            :alerts="allAlerts"
            :criteria="criteriaForTable"
            :loading="loading"
            :selected-level="selectedLevel"
            :selected-criterion="selectedCriterion"
            :sort-direction="sortDirection"
            @toggle-sort="toggleSort"
            @update:selected-criterion="selectedCriterion = $event"
            @update:selected-level="selectedLevel = $event"
            @criterion-changed="handleCriterionChange"
          />
        </div>
      </div>

      <div v-else ref="mapContainer" class="map map-expanded"></div>
    </div>

    <DashboardPopup 
      v-if="showDashboard && canAccessFiltersAndDashboard" 
      :filtered-zones="filteredZones"
      :start-date="startDateTime"
      :end-date="endDateTime"
      @close="closeDashboard" 
    />
  </div>
</template>

<style lang="scss" scoped>
.home-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;

  .dashboard-title {
    margin-bottom: 16px;
    font-size: 24px;
    font-weight: 600;
    text-align: center;
    color: #1f2937;
  }

  .error-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    margin: 0 16px 16px 16px;
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

  .top-bar {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    background: transparent;
    gap: 0.75rem;
    z-index: 1000;

    .filters-button,
    .dashboard-button {
      padding: 0.5rem 1.2rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      color: white;
      font-weight: 500;
      transition: 0.2s;
    }

    .filters-button {
      background: #3b82f6;

      &:hover {
        background: #2563eb;
      }
    }

    .dashboard-button {
      background: #00c853;

      &:hover {
        background: #00963e;
      }
    }
  }

  .content-wrapper {
    display: flex;
    flex: 1;
    position: relative;
    overflow: hidden;
    gap: 1rem;
    padding: 0 1rem 1rem;

    &.agent-layout {
      flex-direction: column;
    }
  }

  .filter-dropdown {
    position: absolute;
    top: 1rem;
    left: 1rem;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    min-width: 320px;

    .filter-content {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .instructions {
        background: #e0f2fe;
        color: #0369a1;
        text-align: center;
        font-size: 0.9rem;
        padding: 0.5rem 1rem;
        border-radius: 6px;
      }

      .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        label {
          font-weight: 500;
          font-size: 0.9rem;
          color: #333;
        }

        .datetime-input {
          width: 100%;
          padding: 0.6rem 0.8rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.9rem;
          color: #333;
          background: white;
          transition: all 0.2s;

          &:hover {
            border-color: #3b82f6;
          }

          &:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
        }
      }

      .status {
        font-size: 0.9rem;
        color: #333;
        padding: 0.5rem;
        background: #f9fafb;
        border-radius: 4px;
        text-align: center;
      }

      .buttons {
        display: flex;
        gap: 0.5rem;

        button {
          flex: 1;
          padding: 0.6rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          color: white;
          transition: 0.2s;
          font-weight: 500;
          font-size: 0.9rem;

          &:disabled {
            background: #bbb !important;
            cursor: not-allowed;
          }
        }

        .apply-btn {
          background: #16a34a;

          &:hover:not(:disabled) {
            background: #15803d;
          }
        }

        .clear-btn {
          background: #dc2626;

          &:hover:not(:disabled) {
            background: #b91c1c;
          }
        }
      }
    }
  }

  .agent-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow: hidden;

    .top-section {
      display: flex;
      gap: 16px;
      height: 50vh;

      .metrics-container {
        width: 220px;
        overflow-y: auto;

        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        &::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        &::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      }

      .map-compact {
        flex: 1;
        height: 100%;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
      }
    }

    .bottom-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
      overflow: hidden;
    }
  }

  .map {
    flex-shrink: 0;
    overflow: hidden;
    border-radius: 8px;
    border: 1px solid #e0e0e0;

    &.map-expanded {
      width: 100%;
      height: calc(100vh - 120px);
    }
  }

  :deep(.leaflet-interactive) {
    outline: none !important;
    cursor: pointer;
  }

  :deep(.legend) {
    background: white;
    padding: 12px 16px;
    border-radius: 5px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
    font-family: Arial, sans-serif;
  }

  :deep(.legend h4) {
    margin: 0 0 10px 0 !important;
    font-weight: bold;
    font-size: 14px !important;
  }

  :deep(.legend div) {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }

  :deep(.legend span) {
    font-size: 12px !important;
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }

  .map {
    width: 100% !important;
    height: 400px !important;
  }

  .filter-dropdown {
    min-width: 280px;
  }

  .agent-content .top-section {
    flex-direction: column;
    height: auto;

    .metrics-container {
      width: 100%;
      max-height: 300px;
    }

    .map-compact {
      height: 300px;
    }
  }
}
</style>
