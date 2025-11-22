<script setup lang="ts">
import { ref, computed } from 'vue'

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

const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(null)
const startTime = ref<string>('00:00')
const endTime = ref<string>('23:59')

const showStartDatePicker = ref(false)
const showEndDatePicker = ref(false)

function formatDateDisplay(date: Date | null): string {
  if (!date) return ''
  return date.toLocaleDateString('pt-BR')
}

function combineDateTime(date: Date | null, time: string): string {
  if (!date) return ''

  const combined = new Date(date)
  const [hours, minutes] = time.split(':')
  combined.setHours(parseInt(hours), parseInt(minutes), 0, 0)

  return combined.toISOString()
}

const startDateTime = computed(() => combineDateTime(startDate.value, startTime.value))
const endDateTime = computed(() => combineDateTime(endDate.value, endTime.value))

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
  <div class="filter-container">
    <div class="panel-header">
      <div class="header-info">
        <h2>Filtros</h2>
        <span class="separator">|</span>
        <p>Configure os filtros para visualizar dados específicos</p>
      </div>
    </div>

    <div class="filter-content">
      <div class="datetime-row">
        <div class="datetime-inputs">
          <div class="filter-group">
            <label>Data/hora inicial</label>
            <div class="date-time-inputs">
              <v-menu v-model="showStartDatePicker" :close-on-content-click="false">
                <template v-slot:activator="{ props }">
                  <input
                    v-bind="props"
                    :value="formatDateDisplay(startDate)"
                    placeholder="Selecionar data"
                    readonly
                    class="date-input"
                  />
                </template>
                <v-date-picker v-model="startDate" @update:model-value="showStartDatePicker = false" locale="pt-BR" />
              </v-menu>
              <input v-model="startTime" type="time" class="time-input" />
            </div>
          </div>

          <div class="filter-group">
            <label>Data/hora final</label>
            <div class="date-time-inputs">
              <v-menu v-model="showEndDatePicker" :close-on-content-click="false">
                <template v-slot:activator="{ props }">
                  <input
                    v-bind="props"
                    :value="formatDateDisplay(endDate)"
                    placeholder="Selecionar data"
                    readonly
                    class="date-input"
                  />
                </template>
                <v-date-picker v-model="endDate" @update:model-value="showEndDatePicker = false" locale="pt-BR" />
              </v-menu>
              <input v-model="endTime" type="time" class="time-input" />
            </div>
          </div>
        </div>

        <div class="status-info">
          <span v-if="selectedZones.length === 0 && filteredZones.length === 0" class="status-text">
            Nenhuma zona selecionada
          </span>
          <span v-else-if="selectedZones.length > 0" class="status-text">
            Zonas (pré-seleção): {{ selectedZones.join(', ') }}
          </span>
          <span v-else class="status-text"> Zonas aplicadas: {{ filteredZones.join(', ') }} </span>
        </div>

        <div class="action-buttons">
          <button
            @click="applyFilter"
            :disabled="!selectedZones.length && !startDateTime && !endDateTime"
            class="btn btn-primary"
          >
            Filtrar
          </button>
          <button
            @click="clearSelection"
            :disabled="!selectedZones.length && !filteredZones.length && !startDateTime && !endDateTime"
            class="btn btn-secondary"
          >
            Limpar
          </button>
        </div>
      </div>

      <div class="instructions-banner">
        <span class="info-icon">ℹ️</span>
        Dê <strong>dois cliques</strong> em uma zona no mapa para selecioná-la antes de aplicar o filtro.
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filter-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 16px;
}

.panel-header {
  margin-bottom: 16px;

  .header-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  h2 {
    font-size: 1.25rem;
    color: #1f2937;
    margin: 0;
    font-weight: 600;
  }

  .separator {
    color: #d1d5db;
    font-size: 1.2rem;
  }

  p {
    font-size: 0.85rem;
    color: #6b7280;
    margin: 0;
  }
}

.filter-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.datetime-row {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  min-height: 80px;
}

.datetime-inputs {
  display: flex;
  gap: 16px;
  align-self: flex-end;
}

.filter-groups {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.85rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 2px;
  }

  .date-time-inputs {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .date-input,
  .time-input {
    padding: 8px 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.9rem;
    transition: all 0.2s;
    font-family: inherit;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: #00963e;
      box-shadow: 0 0 0 2px rgba(0, 150, 62, 0.1);
    }

    &::placeholder {
      color: #9ca3af;
    }

    &[readonly] {
      cursor: pointer;
      background: white;
    }
  }

  .date-input {
    flex: 1;
    min-width: 160px;
  }

  .time-input {
    min-width: 100px;
  }
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.status-info {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 8px;

  .status-text {
    font-size: 0.85rem;
    color: #374151;
    font-weight: 500;
    text-align: center;
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  align-self: flex-end;
}

.instructions-banner {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1e40af;
  font-size: 0.8rem;
  flex-shrink: 0;
  padding: 4px 8px;
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 4px;

  .info-icon {
    font-size: 1rem;
  }

  strong {
    color: #1e3a8a;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  &-primary {
    background: linear-gradient(135deg, #00c853 0%, #00963e 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgba(0, 150, 62, 0.3);
    }
  }

  &-secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #e5e7eb;

    &:hover:not(:disabled) {
      background: #e5e7eb;
    }
  }
}

.instructions-banner {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1e40af;
  font-size: 0.8rem;
  flex-shrink: 0;
  padding: 4px 8px;
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 4px;

  .info-icon {
    font-size: 1rem;
  }

  strong {
    color: #1e3a8a;
  }
}

@media (max-width: 768px) {
  .filter-container {
    padding: 12px;
  }

  .datetime-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .filter-group .date-time-inputs {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;

    .date-input,
    .time-input {
      min-width: auto;
      width: 100%;
    }
  }

  .info-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    text-align: center;
  }

  .action-buttons {
    justify-content: stretch;
    gap: 6px;

    .btn {
      flex: 1;
      justify-content: center;
    }
  }

  .instructions-banner {
    justify-content: center;
  }

  .panel-header .header-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;

    .separator {
      display: none;
    }
  }
}
</style>
