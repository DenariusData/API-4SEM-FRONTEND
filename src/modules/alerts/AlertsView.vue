<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import alertServices from './services/alertServices'
import AddPagination from '@/shared/pagination/AddPagination.vue'
import type { AlertListItem, AlertLog } from './types/alertsTypes'

const router = useRouter()

const alerts = ref<AlertListItem[]>([])
const loading = ref(true)
const page = ref(0)
const size = ref(10)
const totalPages = ref(0)

const expandedAlertId = ref<number | null>(null)
const alertLogs = ref<Record<number, AlertLog[]>>({})
const loadingLogs = ref<Record<number, boolean>>({})

async function loadAlerts() {
  loading.value = true
  try {
    const response = await alertServices.getAlerts(page.value, size.value)
    alerts.value = response.data.content
    totalPages.value = response.data.totalPages
  } catch (error) {
    console.error('Error loading alerts:', error)
  } finally {
    loading.value = false
  }
}

async function toggleAccordion(alertId: number) {
  if (expandedAlertId.value === alertId) {
    expandedAlertId.value = null
    return
  }

  expandedAlertId.value = alertId

  // Load logs if not already loaded
  if (!alertLogs.value[alertId]) {
    loadingLogs.value[alertId] = true
    try {
      const response = await alertServices.getAlertLogs(alertId)
      alertLogs.value[alertId] = response.data
    } catch (error) {
      console.error('Error loading alert logs:', error)
    } finally {
      loadingLogs.value[alertId] = false
    }
  }
}

function goToFirst() {
  if (page.value !== 0) {
    page.value = 0
    loadAlerts()
  }
}

function nextPage() {
  if (page.value < totalPages.value - 1) {
    page.value++
    loadAlerts()
  }
}

function previousPage() {
  if (page.value > 0) {
    page.value--
    loadAlerts()
  }
}

function goToLast() {
  if (page.value !== totalPages.value - 1) {
    page.value = totalPages.value - 1
    loadAlerts()
  }
}

function getStatusClass(alert: AlertListItem): string {
  return alert.alertClosedAt ? 'closed' : 'open'
}

function formatDateTime(dateTimeString: string | null): string {
  if (!dateTimeString) return ''
  
  return new Date(dateTimeString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusText(alert: AlertListItem): string {
  return alert.alertClosedAt ? `Fechado em ${formatDateTime(alert.alertClosedAt)}` : 'Em aberto'
}

function getLevelClass(level: number): string {
  if (level === 1) return 'level-low'
  if (level === 2) return 'level-medium'
  if (level === 3) return 'level-high'
  return ''
}

function goToAlertDetails(alertId: number) {
  router.push({ name: 'alert-details', params: { id: alertId } })
}

onMounted(loadAlerts)
</script>

<template>
  <div class="alerts-view">
    <div class="header">
      <h1 class="page-title">Alertas</h1>
    </div>

    <div v-if="loading" class="loading">Carregando alertas...</div>

    <div v-else class="alerts-list">
      <div 
        v-for="alert in alerts" 
        :key="alert.alertId" 
        class="alert-card"
        :class="{ expanded: expandedAlertId === alert.alertId }"
      >
        <div class="alert-header" @click="goToAlertDetails(alert.alertId)">
          <div class="alert-info">
            <span class="alert-id">Alerta {{ alert.alertId }}: {{ alert.criterionName }} na {{ alert.alertRegion }}</span>
            <span 
              class="alert-status" 
              :class="getStatusClass(alert)"
            >
              {{ getStatusText(alert) }}
            </span>
          </div>
          
          <button 
            class="toggle-btn"
            @click.stop="toggleAccordion(alert.alertId)"
          >
            <v-icon>
              {{ expandedAlertId === alert.alertId ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
            </v-icon>
          </button>
        </div>

        <div 
          v-if="expandedAlertId === alert.alertId" 
          class="alert-logs-container"
        >
          <h3 class="logs-title">Histórico de Alterações</h3>
          
          <div v-if="loadingLogs[alert.alertId]" class="loading-logs">
            Carregando histórico...
          </div>

          <div v-else-if="alertLogs[alert.alertId]?.length" class="logs-scroll">
            <div 
              v-for="log in alertLogs[alert.alertId]" 
              :key="log.alertLogId"
              class="log-item"
            >
              <div class="log-datetime">{{ formatDateTime(log.logDatetime) }}</div>
              <div class="log-levels">
                <span class="level-badge" :class="getLevelClass(log.previousLevel)">
                  Nível {{ log.previousLevel }}
                </span>
                <v-icon class="arrow-icon">mdi-arrow-right</v-icon>
                <span class="level-badge" :class="getLevelClass(log.newLevel)">
                  Nível {{ log.newLevel }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="no-logs">
            Nenhum histórico disponível
          </div>
        </div>
      </div>
    </div>

    <AddPagination
      v-if="!loading && alerts.length"
      :page="page"
      :total-pages="totalPages"
      @go-first="goToFirst"
      @go-prev="previousPage"
      @go-next="nextPage"
      @go-last="goToLast"
    />
  </div>
</template>

<style lang="scss" scoped>
.alerts-view {
  padding: 24px;
}

.header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: #666;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-card {
  border: 1px solid #d1d1d1;
  border-radius: 8px;
  background: white;
  overflow: hidden;
  transition: all 0.3s ease;

  &.expanded {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #f9f9f9;
  }
}

.alert-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.alert-id {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.alert-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;

  &.open {
    background: #ffd60a;
    color: #333;
  }

  &.closed {
    background: #e0e0e0;
    color: #555;
  }
}

.toggle-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: color 0.2s ease;

  &:hover {
    color: #333;
  }
}

.alert-logs-container {
  border-top: 1px solid #e5e5e5;
  padding: 20px;
  background: #fafafa;
}

.logs-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.loading-logs {
  text-align: center;
  padding: 20px;
  color: #666;
}

.logs-scroll {
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #e0e0e0;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #999;
    border-radius: 3px;

    &:hover {
      background: #777;
    }
  }
}

.log-item {
  padding: 12px 16px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.log-datetime {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.log-levels {
  display: flex;
  align-items: center;
  gap: 12px;
}

.level-badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;

  &.level-low {
    background: #00c853;
    color: white;
  }

  &.level-medium {
    background: #ffd60a;
    color: #333;
  }

  &.level-high {
    background: #ff1e1e;
    color: white;
  }
}

.arrow-icon {
  color: #999;
  font-size: 18px;
}

.no-logs {
  text-align: center;
  padding: 20px;
  color: #999;
  font-style: italic;
}
</style>
