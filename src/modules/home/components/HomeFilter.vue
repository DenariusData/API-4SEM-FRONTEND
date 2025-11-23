<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoleStore } from '@/modules/login/store/roleStore'
import DashboardPopup from '@/modules/dashboards/DashboardsPopup.vue'

interface Props {
  selectedZones: string[]
  filteredZones: string[]
}

interface Emits {
  (e: 'apply-filter'): void
  (e: 'clear-selection'): void
  (e: 'update:start-date-time', value: string): void
  (e: 'update:end-date-time', value: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const roleStore = useRoleStore()

const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(null)
const startTime = ref<string>('00:00')
const endTime = ref<string>('23:59')

const showStartDatePicker = ref(false)
const showEndDatePicker = ref(false)
const showFilters = ref(false)
const showDashboard = ref(false)

function combineDateTime(date: Date | null, time: string): string {
  if (!date) return ''

  const combined = new Date(date)
  const [hours, minutes] = time.split(':')
  combined.setHours(parseInt(hours), parseInt(minutes), 0, 0)

  return combined.toISOString()
}

function openDashboard() {
  showDashboard.value = true
}

function closeDashboard() {
  showDashboard.value = false
}

const startDateTime = computed(() => combineDateTime(startDate.value, startTime.value))
const endDateTime = computed(() => combineDateTime(endDate.value, endTime.value))
const canAccessFilters = computed(() => roleStore.isAdmin || roleStore.isGestor || roleStore.isAgente)
const canAccessDashboard = computed(() => roleStore.isAdmin || roleStore.isGestor)

function applyFilter() {
  emit('apply-filter')
  emit('update:start-date-time', startDateTime.value)
  emit('update:end-date-time', endDateTime.value)
}

function clearSelection() {
  startDate.value = null
  endDate.value = null
  startTime.value = '00:00'
  endTime.value = '23:59'
  showStartDatePicker.value = false
  showEndDatePicker.value = false
  emit('clear-selection')
  emit('update:start-date-time', '')
  emit('update:end-date-time', '')
}
</script>

<template>
  <div>
    <div v-if="canAccessFilters || canAccessDashboard" class="top-bar">
      <button v-if="canAccessFilters" class="filters-button" @click="showFilters = !showFilters">Filtros</button>
      <button v-if="canAccessDashboard" class="dashboard-button" @click="openDashboard">Dashboard's</button>
    </div>

    <div class="content-wrapper">
      <div v-if="showFilters && canAccessFilters" class="filter-dropdown">
        <div class="filter-content">
          <div class="instructions">ℹ️ Dê <b>dois cliques</b> em uma zona para selecioná-la</div>

          <div class="filter-group">
            <label for="start-datetime">Data/hora inicial</label>
            <input id="start-datetime" v-model="startDateTime" type="datetime-local" class="datetime-input" />
          </div>

          <div class="filter-group">
            <label for="end-datetime">Data/hora final</label>
            <input id="end-datetime" v-model="endDateTime" type="datetime-local" class="datetime-input" />
          </div>

          <div class="status">
            <span v-if="selectedZones.length === 0 && filteredZones.length === 0"> Nenhuma zona selecionada </span>
            <span v-else-if="selectedZones.length > 0"> Zonas (pré-seleção): {{ selectedZones.join(', ') }} </span>
            <span v-else> Zonas aplicadas: {{ filteredZones.join(', ') }} </span>
          </div>

          <div class="buttons">
            <button
              @click="clearSelection"
              :disabled="!selectedZones.length && !filteredZones.length && !startDateTime && !endDateTime"
              class="clear-btn"
            >
              Limpar
            </button>
            <button
              @click="applyFilter"
              :disabled="!selectedZones.length && !startDateTime && !endDateTime"
              class="apply-btn"
            >
              Filtrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <DashboardPopup
      v-if="showDashboard && canAccessDashboard"
      :filtered-zones="filteredZones"
      :start-date="startDateTime"
      :end-date="endDateTime"
      @close="closeDashboard"
    />
  </div>
</template>

<style lang="scss" scoped>
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
  position: absolute;
  top: 140px;
  left: 1rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 1rem;
  padding: 0 1rem 1rem;
  z-index: 1001;
}

.filter-dropdown {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
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
</style>
