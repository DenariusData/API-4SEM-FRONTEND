<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import alertServices from './services/alertServices'
import AddPagination from '@/shared/pagination/AddPagination.vue'
import AlertFilters from './components/AlertFilters.vue'
import type { AlertListItem, AlertLog } from './types/alertsTypes'
import type { AlertFiltersData } from './components/AlertFilters.vue'

const router = useRouter()

const alerts = ref<AlertListItem[]>([])
const loading = ref(true)
const page = ref(0)
const size = ref(10)
const totalPages = ref(0)

const expandedAlertId = ref<number | null>(null)
const alertLogs = ref<Record<number, AlertLog[]>>({})
const loadingLogs = ref<Record<number, boolean>>({})

const showFilters = ref(false)
const currentFilters = ref<AlertFiltersData>({})

async function loadAlerts() {
  loading.value = true
  try {
    const response = await alertServices.getAlerts(page.value, size.value, currentFilters.value)
    alerts.value = response.data.content
    totalPages.value = response.data.totalPages
  } catch (error) {
    console.error('Error loading alerts:', error)
  } finally {
    loading.value = false
  }
}

function handleApplyFilters(filters: AlertFiltersData) {
  currentFilters.value = filters
  page.value = 0
  loadAlerts()
}

function handleClearFilters() {
  currentFilters.value = {}
  page.value = 0
  loadAlerts()
}

async function toggleAccordion(alertId: number) {
  if (expandedAlertId.value === alertId) {
    expandedAlertId.value = null
    return
  }

  expandedAlertId.value = alertId

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
  return alert.closedAt ? 'closed' : 'open'
}

function formatDateTime(dateTimeString: string | null): string {
  if (!dateTimeString) return ''

  return new Date(dateTimeString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusText(alert: AlertListItem): string {
  return alert.closedAt ? 'Fechado' : 'Em aberto'
}

function getLevelClass(level: number): string {
  if (level === 1) return 'level-1'
  if (level === 2) return 'level-2'
  if (level === 3) return 'level-3'
  if (level === 4) return 'level-4'
  if (level === 5) return 'level-5'
  return ''
}

function goToAlertDetails(alertId: number) {
  router.push({ name: 'alert-details', params: { id: alertId } })
}

onMounted(loadAlerts)
</script>

<template>
  <div class="alerts-view">
    <div class="page-header">
      <h1>Gerenciamento de Alertas</h1>
      <p>Visualize e gerencie os alertas do sistema de mobilidade urbana</p>
    </div>

    <div class="alerts-container">
      <div class="panel-header">
        <div class="header-info">
          <h2>Lista de Alertas</h2>
          <span class="separator">|</span>
          <p>Monitore alertas ativos e histórico de mudanças de nível</p>
        </div>
        <button @click="showFilters = !showFilters" class="btn btn-primary">
          <span class="btn-icon">{{ showFilters ? '✕' : '⚙' }}</span>
          {{ showFilters ? 'Ocultar Filtros' : 'Filtros' }}
        </button>
      </div>

      <AlertFilters v-model="showFilters" @apply="handleApplyFilters" @clear="handleClearFilters" />

      <div v-if="loading" class="loading-state">
        <span class="loading-icon">⟳</span>
        <p>Carregando alertas...</p>
      </div>

      <div v-else-if="alerts.length === 0" class="empty-state">
        <span class="empty-icon">📋</span>
        <p>Nenhum alerta encontrado</p>
        <button @click="handleClearFilters" class="btn-link">Limpar filtros</button>
      </div>

      <div v-else class="alerts-list">
        <div
          v-for="alert in alerts"
          :key="alert.id"
          class="item-card alert-card"
          :class="{ expanded: expandedAlertId === alert.id }"
        >
          <div class="item-content">
            <div class="item-main" @click="goToAlertDetails(alert.id)">
              <div class="item-header-row">
                <h3>Alerta {{ alert.id }}: {{ alert.criterionName }}</h3>
                <span class="badge" :class="getStatusClass(alert)">
                  {{ getStatusText(alert) }}
                </span>
              </div>
              <p class="item-info"><strong>Região:</strong> {{ alert.regionName }}</p>
              <p class="item-info"><strong>Criado em:</strong> {{ formatDateTime(alert.createdAt) }}</p>
            </div>
            <div class="item-actions">
              <button
                @click.stop="toggleAccordion(alert.id)"
                class="btn-icon-only"
                :title="expandedAlertId === alert.id ? 'Ocultar histórico' : 'Ver histórico'"
              >
                {{ expandedAlertId === alert.id ? '▲' : '▼' }}
              </button>
            </div>
          </div>

          <div v-if="expandedAlertId === alert.id" class="alert-logs-container">
            <h4 class="logs-title">Histórico de Alterações</h4>

            <div v-if="loadingLogs[alert.id]" class="loading-logs">
              <span class="loading-icon">⟳</span>
              Carregando histórico...
            </div>

            <div v-else-if="alertLogs[alert.id]?.length" class="logs-scroll">
              <div v-for="log in alertLogs[alert.id]" :key="log.id" class="log-item">
                <div class="log-datetime">{{ formatDateTime(log.createdAt) }}</div>
                <div class="log-levels">
                  <span class="level-badge" :class="getLevelClass(log.previousLevel)">
                    Nível {{ log.previousLevel }}
                  </span>
                  <span class="arrow-icon">→</span>
                  <span class="level-badge" :class="getLevelClass(log.newLevel)"> Nível {{ log.newLevel }} </span>
                </div>
              </div>
            </div>

            <div v-else class="no-logs">
              <span class="empty-icon">📄</span>
              <p>Nenhum histórico disponível</p>
            </div>
          </div>
        </div>
      </div>

      <AddPagination
        v-if="!loading && alerts?.length"
        :page="page"
        :total-pages="totalPages"
        @go-first="goToFirst"
        @go-prev="previousPage"
        @go-next="nextPage"
        @go-last="goToLast"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.alerts-view {
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin: 0 auto;
  max-width: 1200px;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 20px;

  h1 {
    font-size: 2.5rem;
    color: #4d4d4d;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #222121 0%, #5a5b5a 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 700;
  }

  p {
    font-size: 1.1rem;
    color: #6b7280;
    margin: 0;
  }
}

.alerts-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 24px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 20px;

  .header-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  h2 {
    font-size: 1.5rem;
    color: #1f2937;
    margin: 0 0 4px 0;
    font-weight: 600;
  }

  .separator {
    color: #d1d5db;
    font-size: 1.2rem;
  }

  p {
    font-size: 0.9rem;
    color: #6b7280;
    margin: 0;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &-primary {
    background: linear-gradient(135deg, #00c853 0%, #00963e 100%);
    color: white;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 150, 62, 0.3);
    }
  }

  &-icon {
    font-size: 1.2rem;
  }

  &-link {
    background: none;
    border: none;
    color: #00963e;
    cursor: pointer;
    font-weight: 500;
    padding: 4px 8px;
    font-size: 0.95rem;

    &:hover {
      text-decoration: underline;
    }
  }

  &-icon-only {
    background: none;
    border: none;
    padding: 8px;
    cursor: pointer;
    color: #6b7280;
    font-size: 1.1rem;
    border-radius: 6px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: #f3f4f6;
      color: #374151;
    }
  }
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  background: #f9fafb;
  border-radius: 8px;

  .loading-icon {
    font-size: 2rem;
    display: block;
    margin-bottom: 16px;
    animation: spin 1s linear infinite;
  }

  p {
    color: #6b7280;
    margin: 0;
    font-size: 1rem;
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #f9fafb;
  border-radius: 8px;
  border: 2px dashed #e5e7eb;

  .empty-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 16px;
  }

  p {
    color: #6b7280;
    margin: 8px 0;
  }
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 24px;
  margin-bottom: 24px;
}

.item-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #d1d5db;
  }

  &.expanded {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .item-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }

  .item-main {
    flex: 1;
    cursor: pointer;
  }

  .item-header-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  h3 {
    font-size: 1.15rem;
    color: #1f2937;
    margin: 0;
    font-weight: 600;
  }

  .item-info {
    font-size: 0.9rem;
    color: #6b7280;
    margin: 6px 0;

    strong {
      color: #374151;
    }
  }

  .item-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;

  &.open {
    background: #fef3c7;
    color: #92400e;
  }

  &.closed {
    background: #f3f4f6;
    color: #6b7280;
  }
}

.alert-logs-container {
  border-top: 1px solid #e5e7eb;
  padding: 20px 0 0 0;
  margin-top: 20px;

  .logs-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 16px;
    color: #1f2937;
  }

  .loading-logs {
    text-align: center;
    padding: 20px;
    color: #6b7280;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    .loading-icon {
      animation: spin 1s linear infinite;
    }
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
      background: #f3f4f6;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 3px;

      &:hover {
        background: #9ca3af;
      }
    }
  }

  .log-item {
    padding: 12px 16px;
    background: #f9fafb;
    border-radius: 6px;
    border: 1px solid #e5e7eb;

    .log-datetime {
      font-size: 0.8rem;
      color: #6b7280;
      margin-bottom: 8px;
    }

    .log-levels {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .no-logs {
    text-align: center;
    padding: 40px 20px;
    color: #6b7280;

    .empty-icon {
      font-size: 2rem;
      display: block;
      margin-bottom: 12px;
    }

    p {
      margin: 0;
      font-style: italic;
    }
  }
}

.level-badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;

  &.level-1 {
    background: #4caf50;
    color: white;
  }

  &.level-2 {
    background: #8bc34a;
    color: white;
  }

  &.level-3 {
    background: #ffd60a;
    color: #333;
  }

  &.level-4 {
    background: #ff9800;
    color: white;
  }

  &.level-5 {
    background: #f44336;
    color: white;
  }
}

.arrow-icon {
  color: #9ca3af;
  font-size: 1rem;
  font-weight: bold;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .alerts-view {
    padding: 12px;
    gap: 24px;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;

    .header-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;

      .separator {
        display: none;
      }
    }
  }

  .item-card .item-content {
    flex-direction: column;
  }

  .item-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
