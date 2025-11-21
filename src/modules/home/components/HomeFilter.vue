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

// Refs para as datas (objetos Date)
const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(null)
const startTime = ref<string>('00:00')
const endTime = ref<string>('23:59')

// Refs para controlar a exibição dos pickers
const showStartDatePicker = ref(false)
const showEndDatePicker = ref(false)

// Função para formatar data para exibição (dd/mm/yyyy)
function formatDateDisplay(date: Date | null): string {
  if (!date) return ''
  return date.toLocaleDateString('pt-BR')
}

// Função para combinar data e hora em formato ISO
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
  <div class="filter-bar">
    <div class="filters">
      <div class="filter-group">
        <label>Data/hora inicial:</label>
        <div class="date-time-container">
          <v-menu v-model="showStartDatePicker" :close-on-content-click="false">
            <template v-slot:activator="{ props }">
              <v-text-field
                v-bind="props"
                :model-value="formatDateDisplay(startDate)"
                label="Selecionar data"
                prepend-inner-icon="mdi-calendar"
                readonly
                variant="outlined"
                density="compact"
                hide-details
                placeholder="dd/mm/yyyy"
              />
            </template>
            <v-date-picker
              v-model="startDate"
              @update:model-value="showStartDatePicker = false"
              locale="pt-BR"
              :display-date="formatDateDisplay(startDate)"
            />
          </v-menu>

          <v-text-field
            v-model="startTime"
            label="Hora"
            type="time"
            prepend-inner-icon="mdi-clock-outline"
            variant="outlined"
            density="compact"
            hide-details
          />
        </div>
      </div>

      <div class="filter-group">
        <label>Data/hora final:</label>
        <div class="date-time-container">
          <v-menu v-model="showEndDatePicker" :close-on-content-click="false">
            <template v-slot:activator="{ props }">
              <v-text-field
                v-bind="props"
                :model-value="formatDateDisplay(endDate)"
                label="Selecionar data"
                prepend-inner-icon="mdi-calendar"
                readonly
                variant="outlined"
                density="compact"
                hide-details
                placeholder="dd/mm/yyyy"
              />
            </template>
            <v-date-picker
              v-model="endDate"
              @update:model-value="showEndDatePicker = false"
              locale="pt-BR"
              :display-date="formatDateDisplay(endDate)"
            />
          </v-menu>

          <v-text-field
            v-model="endTime"
            label="Hora"
            type="time"
            prepend-inner-icon="mdi-clock-outline"
            variant="outlined"
            density="compact"
            hide-details
          />
        </div>
      </div>
    </div>

    <div class="status">
      <span v-if="selectedZones.length === 0 && filteredZones.length === 0"> Nenhuma zona selecionada </span>
      <span v-else-if="selectedZones.length > 0"> Zonas (pré-seleção): {{ selectedZones.join(', ') }} </span>
      <span v-else> Zonas aplicadas: {{ filteredZones.join(', ') }} </span>
    </div>

    <div class="buttons">
      <v-btn
        @click="applyFilter"
        :disabled="!selectedZones.length && !startDateTime && !endDateTime"
        color="success"
        variant="flat"
        size="small"
      >
        Filtrar
      </v-btn>
      <v-btn
        @click="clearSelection"
        :disabled="!selectedZones.length && !filteredZones.length && !startDateTime && !endDateTime"
        color="error"
        variant="flat"
        size="small"
      >
        Limpar
      </v-btn>
    </div>
  </div>

  <div class="instructions">
    ℹ️ Dê <b>dois cliques</b> em uma zona no mapa para selecioná-la antes de aplicar o filtro.
  </div>
</template>

<style lang="scss" scoped>
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #f3f4f6;
  border-bottom: 1px solid #ddd;
  border-radius: 6px 6px 0 0;
  gap: 1rem;

  .filters {
    display: flex;
    gap: 1.5rem;
    align-items: flex-end;

    .filter-group {
      display: flex;
      flex-direction: column;
      font-size: 0.85rem;
      min-width: 300px;

      label {
        font-weight: 500;
        margin-bottom: 0.5rem;
        color: #374151;
        font-size: 0.9rem;
      }

      .date-time-container {
        display: flex;
        gap: 0.5rem;
        align-items: center;

        :deep(.v-input) {
          flex: 1;
        }

        :deep(.v-field) {
          background-color: white;
        }

        :deep(.v-field__input) {
          font-size: 0.875rem;
        }

        // Campo de data maior que o de hora
        :deep(.v-menu > .v-input) {
          min-width: 180px;
        }

        // Campo de hora menor
        :deep(.v-input:last-child) {
          min-width: 120px;
        }
      }
    }
  }

  .status {
    font-size: 0.9rem;
    color: #333;
    flex: 1;
    text-align: center;
    margin: 0 1rem;
  }

  .buttons {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
}

.instructions {
  background: #e0f2fe;
  color: #0369a1;
  text-align: center;
  font-size: 0.9rem;
  padding: 0.5rem;
  border-radius: 0 0 6px 6px;
  border: 1px solid #b3e0ff;
}

// Estilização do date picker
:deep(.v-date-picker) {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

// Responsividade
@media (max-width: 1200px) {
  .filter-bar {
    .filters {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;

      .filter-group {
        min-width: auto;
      }
    }

    .status {
      margin: 0.5rem 0;
    }
  }
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;

    .filters .filter-group .date-time-container {
      flex-direction: column;
      gap: 0.75rem;

      :deep(.v-input) {
        width: 100%;
        min-width: auto;
      }
    }

    .buttons {
      justify-content: center;
      gap: 1rem;

      :deep(.v-btn) {
        flex: 1;
      }
    }
  }
}
</style>
