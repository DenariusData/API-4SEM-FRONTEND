<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getRegions } from '@/modules/persons/services/regionService'
import indicatorsServices from '@/modules/indicators/services/indicatorsServices'

export interface AlertFiltersData {
  regionIds?: number[]
  criterionIds?: number[]
  levels?: number[]
  isOpen?: boolean
  startDate?: string
  endDate?: string
}

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'apply', filters: AlertFiltersData): void
  (e: 'clear'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const regions = ref<{ id: number; name: string }[]>([])
const criteria = ref<{ id: number; name: string }[]>([])
const selectedRegions = ref<number[]>([])
const selectedCriteria = ref<number[]>([])
const selectedLevels = ref<number[]>([])
const selectedStatus = ref<boolean | null>(null)
const startDate = ref<string>('')
const endDate = ref<string>('')

async function loadFiltersData() {
  try {
    const [regionsResponse, criteriaResponse] = await Promise.all([
      getRegions(),
      indicatorsServices.get(),
    ])
    regions.value = regionsResponse.data
    criteria.value = criteriaResponse.data
  } catch (error) {
    console.error('Error loading filter data:', error)
  }
}

function buildFilters(): AlertFiltersData {
  const filters: AlertFiltersData = {}
  
  if (selectedRegions.value.length > 0) filters.regionIds = selectedRegions.value
  if (selectedCriteria.value.length > 0) filters.criterionIds = selectedCriteria.value
  if (selectedLevels.value.length > 0) filters.levels = selectedLevels.value
  if (selectedStatus.value !== null) filters.isOpen = selectedStatus.value
  
  if (startDate.value) {
    filters.startDate = startDate.value + ':00'
  }
  if (endDate.value) {
    filters.endDate = endDate.value + ':00'
  }

  return filters
}

function applyFilters() {
  emit('apply', buildFilters())
}

function clearFilters() {
  selectedRegions.value = []
  selectedCriteria.value = []
  selectedLevels.value = []
  selectedStatus.value = null
  startDate.value = ''
  endDate.value = ''
  emit('clear')
}

onMounted(loadFiltersData)
</script>

<template>
  <v-expand-transition>
    <div v-show="modelValue" class="filters-container">
      <v-card class="pa-4">
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="selectedRegions"
              :items="regions"
              item-title="name"
              item-value="id"
              label="Regiões"
              multiple
              chips
              clearable
              variant="outlined"
              density="comfortable"
            ></v-select>
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="selectedCriteria"
              :items="criteria"
              item-title="name"
              item-value="id"
              label="Critérios"
              multiple
              chips
              clearable
              variant="outlined"
              density="comfortable"
            ></v-select>
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="selectedLevels"
              :items="[1, 2, 3, 4, 5]"
              label="Níveis"
              multiple
              chips
              clearable
              variant="outlined"
              density="comfortable"
            ></v-select>
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="selectedStatus"
              :items="[
                { title: 'Abertos', value: true },
                { title: 'Fechados', value: false }
              ]"
              label="Status"
              clearable
              variant="outlined"
              density="comfortable"
            ></v-select>
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="startDate"
              label="Data e Hora de Início"
              type="datetime-local"
              variant="outlined"
              density="comfortable"
              clearable
              prepend-inner-icon="mdi-calendar-start"
              hint="Formato: DD/MM/AAAA HH:mm"
              persistent-hint
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="endDate"
              label="Data e Hora de Fim"
              type="datetime-local"
              variant="outlined"
              density="comfortable"
              clearable
              prepend-inner-icon="mdi-calendar-end"
              hint="Formato: DD/MM/AAAA HH:mm"
              persistent-hint
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" class="d-flex justify-end gap-2">
            <v-btn variant="outlined" @click="clearFilters">
              Limpar
            </v-btn>
            <v-btn color="primary" @click="applyFilters">
              Aplicar Filtros
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </div>
  </v-expand-transition>
</template>

<style scoped>
.filters-container {
  margin-bottom: 24px;
}

.gap-2 {
  gap: 8px;
}
</style>
