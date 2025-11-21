<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getRegions } from '@/modules/persons/services/regionService'
import { registerPeriodicTask } from '@/shared/periodicUpdater'
import { useRoleStore } from '@/modules/login/store/roleStore'
import alerts from '@/modules/alerts/services/alertServices'

import MetricCards from '@/modules/home/components/MetricCards.vue'
import AlertsTable from '@/modules/home/components/AlertsTable.vue'
import MapContainer from '@/modules/home/components/MapContainer.vue'
import HomeFilter from '@/modules/home/components/HomeFilter.vue'

import type { Criterion, ZoneMetric, Alert } from '@/modules/home/types/homeTypes'

const selectedZones = ref<string[]>([])
const filteredZones = ref<string[]>([])
const startDateTime = ref<string>('')
const endDateTime = ref<string>('')

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

async function fetchRegionData(): Promise<void> {
  try {
    const [regionsResponse, levelsResponse] = await Promise.all([getRegions(), alerts.getRegionsLevel()])

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
  }
}

onMounted(async () => {
  unregisterPeriodicTask = registerPeriodicTask(async () => {
    await fetchRegionData()
  })

  await fetchRegionData()

  if (isAgent.value) {
    await fetchRegionsCriterias()
    await fetchAllRegionsAlerts()
  }
})

watch(isAgent, async (newIsAgent, oldIsAgent) => {
  if (newIsAgent && !oldIsAgent) {
    await fetchRegionsCriterias()
    await fetchAllRegionsAlerts()
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

function toggleZone(region: string, layer: L.Layer) {
  const index = selectedZones.value.indexOf(region)
  if (index >= 0) {
    selectedZones.value.splice(index, 1)
    stopAnimation(region)
  } else {
    selectedZones.value.push(region)
    startAnimation(region, layer)
  }
}

function startAnimation(region: string, layer: L.Layer) {
  stopAnimation(region)
  if (!(layer as L.Path).setStyle) return

  let glow = 0
  const interval = setInterval(() => {
    if (!(layer as L.Path).setStyle) return
    const intensity = 0.5 + 0.3 * Math.sin(glow)
    ;(layer as L.Path).setStyle({
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
  filteredZones.value = [...selectedZones.value]
  selectedZones.value = []

  activeAnimations.forEach(clearInterval)
  activeAnimations.clear()

  if (isAgent.value) {
    fetchRegionsCriterias()
    fetchAllRegionsAlerts()
  }
}

function clearSelection() {
  selectedZones.value = []
  filteredZones.value = []
  startDateTime.value = ''
  endDateTime.value = ''
  activeAnimations.forEach(clearInterval)
  activeAnimations.clear()
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

async function fetchAllRegionsAlerts() {
  return fetchAlerts()
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

function toggleSort() {
  sortDirection.value = sortDirection.value === 'desc' ? 'asc' : 'desc'
}

function handleZoneToggle(region: string, layer: L.Layer) {
  toggleZone(region, layer)
}

function handleCriterionChange() {
  fetchAllRegionsAlerts()
}
</script>

<template>
  <div class="home-container">
    <h2 v-if="isAgent" class="dashboard-title">Dashboard de Monitoramento</h2>

    <div v-if="errorMessage" class="error-banner">
      <span class="error-icon">⚠️</span>
      <span class="error-text">{{ errorMessage }}</span>
      <button @click="errorMessage = ''" class="error-close">✕</button>
    </div>

    <HomeFilter
      :selected-zones="selectedZones"
      :filtered-zones="filteredZones"
      @apply-filter="applyFilter"
      @clear-selection="clearSelection"
      @update:start-date-time="startDateTime = $event"
      @update:end-date-time="endDateTime = $event"
    />

    <div v-if="isAgent" class="agent-layout">
      <div class="top-section">
        <div class="metrics-container">
          <MetricCards :metrics="zoneMetrics" />
        </div>

        <MapContainer
          compact
          :region-name-to-level-map="regionNameToLevelMap"
          :selected-zones="selectedZones"
          :filtered-zones="filteredZones"
          :is-agent="isAgent"
          @zone-toggle="handleZoneToggle"
        />
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

    <div v-else class="normal-layout">
      <MapContainer
        :region-name-to-level-map="regionNameToLevelMap"
        :selected-zones="selectedZones"
        :filtered-zones="filteredZones"
        :is-agent="isAgent"
        @zone-toggle="handleZoneToggle"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home-container {
  display: flex;
  flex-direction: column;
  padding: 0;

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

  .agent-layout {
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
    }

    .bottom-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
      overflow: hidden;
    }
  }

  .normal-layout {
    display: flex;
    flex-direction: column;

    :deep(.map-container) {
      height: calc(100vh - 254px);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
