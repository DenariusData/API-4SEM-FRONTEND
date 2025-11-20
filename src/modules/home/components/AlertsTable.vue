<template>
  <div class="alerts-table-container">
    <div class="table-header">
      <h3>Top Alertas Mais Críticos ({{ filteredAlerts.length }})</h3>
    </div>

    <div class="filters-section">
      <div class="filters">
        <div class="filter-item">
          <label>Filtrar por tipo:</label>
          <select :value="selectedCriterion" @change="onCriterionChange">
            <option value="">Todos os tipos</option>
            <option v-for="criterion in criteria" :key="criterion.id" :value="criterion.id">
              {{ criterion.name }}
            </option>
          </select>
        </div>

        <div class="filter-item">
          <label>Filtrar por nível:</label>
          <select :value="selectedLevel" @change="onLevelChange">
            <option value="">Todos os níveis</option>
            <option v-for="level in [1, 2, 3, 4, 5]" :key="level" :value="level">Nível {{ level }}</option>
          </select>
        </div>
      </div>
    </div>

    <table class="alerts-table" v-if="filteredAlerts.length > 0">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tipo</th>
          <th @click="emit('toggleSort')" class="sortable">
            Nível
            <span>{{ sortDirection === 'desc' ? '↓' : '↑' }}</span>
          </th>
          <th>Mensagem</th>
          <th>Data/Hora</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="item in filteredAlerts" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.indicator || item.criterionName || 'N/A' }}</td>
          <td>
            <span class="badge" :class="`badge-nivel-${item.newLevel || item.level}`">
              Nível {{ item.newLevel || item.level }}
            </span>
          </td>
          <td class="message-cell">
            <span v-if="!isExpanded(item.id)" class="message-truncated">
              {{ truncateMessage(item.message || item.location || 'Sem mensagem') }}
            </span>
            <span v-else>{{ item.message || item.location || 'Sem mensagem' }}</span>
            <button
              v-if="(item.message || item.location) && (item.message || item.location || '').length > 80"
              @click="toggleMessageExpand(item.id)"
              class="expand-btn"
            >
              {{ isExpanded(item.id) ? 'Menos' : 'Mais' }}
            </button>
          </td>
          <td class="date-cell">{{ formatFullDate(item.timestamp || item.createdAt) }}</td>
          <td>{{ item.finalized ? 'Finalizado' : 'Ativo' }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else class="no-data">
      {{
        loading ? 'Carregando...' : `Nenhum alerta encontrado${selectedLevel ? ' para este nível de criticidade' : ''}.`
      }}
    </p>
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
.alerts-table-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .table-header {
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }
  }

  .filters-section {
    .filters {
      display: flex;
      gap: 24px;
      align-items: center;
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
    }

    .filter-item {
      display: flex;
      align-items: center;
      gap: 8px;

      label {
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      }

      select {
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        background: white;
        min-width: 180px;

        &:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
      }
    }
  }

  .alerts-table {
    flex: 1;
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    font-size: 14px;

    th,
    td {
      padding: 6px 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: middle;
    }

    tr {
      height: auto;
    }

    th {
      background: #f9fafb;
      font-weight: 600;
      font-size: 12px;
      white-space: nowrap;
      color: #374151;
      padding: 8px 12px;
    }

    .sortable {
      cursor: pointer;
      user-select: none;

      &:hover {
        background: #f3f4f6;
      }

      span {
        margin-left: 4px;
      }
    }

    .message-cell {
      max-width: 300px;

      .expand-btn {
        background: none;
        border: none;
        color: #10b981;
        cursor: pointer;
        padding: 1px 4px;
        margin-left: 4px;
        font-size: 11px;
        border-radius: 3px;

        &:hover {
          background: #f0fdf4;
        }
      }
    }

    .date-cell {
      white-space: nowrap;
      color: #6b7280;
      font-size: 12px;
    }

    .badge {
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 600;
      display: inline-block;
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

    tbody tr:hover {
      background: #f9fafb;
    }

    tbody tr:last-child td {
      border-bottom: none;
    }
  }

  .no-data {
    text-align: center;
    padding: 40px 20px;
    color: #6b7280;
    font-size: 14px;
    font-style: italic;
    margin: 0;
  }
}
</style>
