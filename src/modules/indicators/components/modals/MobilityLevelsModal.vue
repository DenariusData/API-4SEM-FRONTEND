<template>
  <v-dialog v-model="isVisible" max-width="850px" persistent scrollable>
    <v-card class="modal-card">
      <v-card-title class="mobility-levels-modal__header">
        <h2 class="mobility-levels-modal__title">{{ modalTitle }}</h2>
        <v-btn icon variant="text" @click="closeModal" class="mobility-levels-modal__close-btn">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="mobility-levels-modal__content">
        <div v-if="selectedIndicator" class="mobility-levels-modal__indicator">
          <div class="mobility-levels-modal__sections">
            <v-alert
              type="info"
              variant="tonal"
              class="mobility-levels-modal__purpose mb-6"
              border="start"
              border-color="success"
            >
              <strong>Finalidade:</strong> {{ selectedIndicator.purpose }}
            </v-alert>

            <v-card class="mobility-levels-modal__ranges-table mb-6">
              <v-table>
                <thead>
                  <tr>
                    <th>Nível</th>
                    <th>Faixa</th>
                    <th>Classificação</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="range in selectedIndicator.ranges" :key="range.level" :class="`level-${range.level}`">
                    <td>{{ range.level }}</td>
                    <td>{{ range.range }}</td>
                    <td>{{ getLevelLabel(range.level) }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>

            <v-alert
              v-if="selectedIndicator.example"
              type="warning"
              variant="tonal"
              class="mobility-levels-modal__example mb-4"
              border="start"
              border-color="warning"
            >
              <strong>Exemplo:</strong> {{ selectedIndicator.example }}
            </v-alert>

            <v-alert
              v-if="selectedIndicator.nullValue"
              type="error"
              variant="tonal"
              class="mobility-levels-modal__null-value mb-4"
              border="start"
              border-color="error"
            >
              <strong>Valor NULL:</strong> {{ selectedIndicator.nullValue }}
            </v-alert>

            <v-alert
              v-if="selectedIndicator.details"
              type="info"
              variant="tonal"
              class="mobility-levels-modal__details"
              border="start"
              border-color="info"
            >
              <strong>Detalhamento:</strong>
              <p v-html="selectedIndicator.details.replace(/\n/g, '<br>')" class="mt-2 mb-0"></p>
            </v-alert>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Indicator } from '@/modules/indicators/types/indicatorsTypes'

interface Props {
  selectedIndicator?: Indicator | null
}

const props = withDefaults(defineProps<Props>(), {
  selectedIndicator: null,
})

interface MobilityLevel {
  level: number
  label: string
}

const isVisible = ref(false)

const levels: MobilityLevel[] = [
  { level: 1, label: 'Excelente' },
  { level: 2, label: 'Bom' },
  { level: 3, label: 'Intermediário' },
  { level: 4, label: 'Ruim' },
  { level: 5, label: 'Péssimo' },
]

const emit = defineEmits(['close'])

const openModal = () => {
  isVisible.value = true
}

const closeModal = () => {
  isVisible.value = false
  emit('close')
}

const getLevelLabel = (level: number) => {
  const found = levels.find((l) => l.level === level)
  return found ? found.label : ''
}

const selectedIndicator = computed(() => props.selectedIndicator)

const modalTitle = computed(() => {
  if (selectedIndicator.value) {
    return `Critério: ${selectedIndicator.value.name}`
  }
  return 'Critérios e Níveis de Mobilidade'
})

defineExpose({
  openModal,
})
</script>

<style lang="scss" scoped>
.mobility-levels-modal {
  &__header {
    background: linear-gradient(135deg, #00c853 0%, #00963e 100%);
    color: white !important;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 32px;
  }

  &__title {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 600;
    color: white;
  }

  &__close-btn {
    color: white !important;
  }

  &__content {
    max-height: 70vh;
    overflow-y: auto;
  }

  &__sections {
    padding: 8px;
  }

  &__ranges-table {
    :deep(.v-table__wrapper) {
      border-radius: 12px;
      overflow: hidden;
    }

    :deep(.v-table) {
      thead th {
        background: #374151 !important;
        color: white !important;
        font-weight: 600;
      }

      tbody {
        tr {
          &.level-1 {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            font-weight: 500;
          }

          &.level-2 {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white;
            font-weight: 500;
          }

          &.level-3 {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            font-weight: 500;
          }

          &.level-4 {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            font-weight: 500;
          }

          &.level-5 {
            background: linear-gradient(135deg, #991b1b, #7f1d1d);
            color: white;
            font-weight: 500;
          }
        }
      }
    }
  }

  :deep(.v-alert) {
    line-height: 1.6;

    .v-alert__content {
      font-size: 1rem;
    }
  }
}
</style>
