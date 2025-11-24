<template>
  <div class="alerts-container">
    <div class="panel-header">
      <div class="header-info">
        <h2>Top Alertas Mais Críticos</h2>
        <span class="separator">|</span>
        <p>{{ filteredAlerts.length }} alerta(s) encontrado(s)</p>
      </div>
    </div>

    <div class="filters-section">
      <div class="filter-group">
        <label>Filtrar por tipo:</label>
        <select :value="selectedCriterion" @change="onCriterionChange" class="filter-select">
          <option value="">Todos os tipos</option>
          <option v-for="criterion in criteria" :key="criterion.id" :value="criterion.id">
            {{ criterion.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Filtrar por nível:</label>
        <select :value="selectedLevel" @change="onLevelChange" class="filter-select">
          <option value="">Todos os níveis</option>
          <option v-for="level in [1, 2, 3, 4, 5]" :key="level" :value="level">Nível {{ level }}</option>
        </select>
      </div>
    </div>

    <div v-if="filteredAlerts.length === 0" class="empty-state">
      <span class="empty-icon">📊</span>
      <p>
        {{
          loading
            ? 'Carregando alertas...'
            : `Nenhum alerta encontrado${selectedLevel ? ' para este nível de criticidade' : ''}.`
        }}
      </p>
    </div>

    <div v-else class="table-container">
      <table class="alerts-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tipo</th>
            <th @click="emit('toggleSort')" class="sortable">
              Nível
              <span class="sort-icon">{{ sortDirection === 'desc' ? '↓' : '↑' }}</span>
            </th>
            <th>Mensagem</th>
            <th>Data/Hora</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredAlerts" :key="item.id" class="table-row">
            <td class="id-cell">{{ item.id }}</td>
            <td class="type-cell">{{ item.indicator || item.criterionName || 'N/A' }}</td>
            <td class="level-cell">
              <span class="badge" :class="`badge-nivel-${item.newLevel || item.level}`">
                Nível {{ item.newLevel || item.level }}
              </span>
            </td>
            <td class="message-cell">
              <div class="message-content">
                <span v-if="!isExpanded(item.id)" class="message-text">
                  {{ truncateMessage(item.message || item.location || 'Sem mensagem') }}
                </span>
                <span v-else class="message-text">
                  {{ item.message || item.location || 'Sem mensagem' }}
                </span>
                <button
                  v-if="(item.message || item.location) && (item.message || item.location || '').length > 80"
                  @click="toggleMessageExpand(item.id)"
                  class="expand-btn"
                >
                  {{ isExpanded(item.id) ? 'Menos' : 'Mais' }}
                </button>
              </div>
            </td>
            <td class="date-cell">{{ formatFullDate(item.timestamp || item.createdAt) }}</td>
            <td class="status-cell">
              <span :class="['status-badge', item.finalized ? 'status-finalized' : 'status-active']">
                {{ item.finalized ? 'Finalizado' : 'Ativo' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { Alert, Criterion } from '@/modules/home/types/homeTypes'

interface Props {
  alerts: Alert[]
  criteria: Criterion[]
  loading: boolean
  selectedLevel: string
  selectedCriterion: string
  sortDirection: 'asc' | 'desc'
}

interface Emits {
  (event: 'toggleSort'): void
  (event: 'update:selectedCriterion', value: string): void
  (event: 'update:selectedLevel', value: string): void
  (event: 'criterionChanged'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const expandedMessages = ref<Set<number>>(new Set())

const filteredAlerts = computed(() => {
  let alerts = [...props.alerts]

  if (props.selectedLevel) {
    alerts = alerts.filter((alert) => {
      const level = alert.newLevel || alert.level
      return level === Number(props.selectedLevel)
    })
  }

  alerts.sort((a, b) => {
    const levelA = a.newLevel || a.level
    const levelB = b.newLevel || b.level
    return props.sortDirection === 'desc' ? levelB - levelA : levelA - levelB
  })

  return alerts
})

function onCriterionChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:selectedCriterion', target.value)
  emit('criterionChanged')
}

function onLevelChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:selectedLevel', target.value)
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
    minute: '2-digit',
  })
}
</script>

<style lang="scss" scoped>
.alerts-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
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

.filters-section {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
      font-size: 0.9rem;
      font-weight: 500;
      color: #374151;
    }

    .filter-select {
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.9rem;
      background: white;
      cursor: pointer;
      min-width: 180px;
      transition: all 0.2s;

      &:focus {
        outline: none;
        border-color: #00963e;
        box-shadow: 0 0 0 3px rgba(0, 150, 62, 0.1);
      }
    }
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
    font-size: 1rem;
  }
}

.table-container {
  flex: 1;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.alerts-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  font-size: 0.9rem;

  th {
    background: #f9fafb;
    padding: 12px;
    text-align: left;
    font-weight: 600;
    font-size: 0.85rem;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
    white-space: nowrap;

    &.sortable {
      cursor: pointer;
      user-select: none;
      transition: background-color 0.2s;

      &:hover {
        background: #f3f4f6;
      }

      .sort-icon {
        margin-left: 4px;
        color: #00963e;
        font-weight: bold;
      }
    }
  }

  .table-row {
    transition: background-color 0.2s;

    &:hover {
      background: #f9fafb;
    }

    &:last-child td {
      border-bottom: none;
    }
  }

  td {
    padding: 12px;
    border-bottom: 1px solid #e5e7eb;
    vertical-align: middle;
  }

  .id-cell {
    font-weight: 600;
    color: #374151;
    width: 80px;
  }

  .type-cell {
    color: #6b7280;
    max-width: 150px;
  }

  .level-cell {
    width: 120px;
  }

  .message-cell {
    max-width: 300px;

    .message-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .message-text {
      flex: 1;
      color: #374151;
      line-height: 1.4;
    }

    .expand-btn {
      background: none;
      border: none;
      color: #00963e;
      cursor: pointer;
      padding: 2px 6px;
      font-size: 0.8rem;
      border-radius: 4px;
      transition: background-color 0.2s;
      flex-shrink: 0;

      &:hover {
        background: #f0fdf4;
      }
    }
  }

  .date-cell {
    color: #6b7280;
    font-size: 0.85rem;
    white-space: nowrap;
    min-width: 120px;
  }

  .status-cell {
    width: 100px;
  }
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;

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

.status-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;

  &.status-active {
    background: #dbeafe;
    color: #1e40af;
  }

  &.status-finalized {
    background: #f3f4f6;
    color: #6b7280;
  }
}

@media (max-width: 768px) {
  .filters-section {
    flex-direction: column;
    gap: 16px;

    .filter-group .filter-select {
      min-width: auto;
    }
  }

  .alerts-table {
    font-size: 0.8rem;

    th,
    td {
      padding: 8px;
    }

    .message-cell {
      max-width: 200px;
    }
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
}
</style>
