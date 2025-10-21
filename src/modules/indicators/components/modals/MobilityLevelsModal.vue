<script setup lang="ts">
import levelsServices from '@/modules/levels/service/levelsServices'
import { ref, computed } from 'vue'
import type { Indicator } from '@/modules/indicators/types/indicatorsTypes'
import type { Level } from '@/modules/levels/types/levelsTypes'

interface Props {
  selectedIndicator: Indicator
}

const props = defineProps<Props>()

interface MobilityLevel {
  level: number
  label: string
}

const levelList = ref<Level[] | null>(null)
const isLoading = ref(false)
const isVisible = ref(false)

const levels: MobilityLevel[] = [
  { level: 1, label: 'Excelente' },
  { level: 2, label: 'Bom' },
  { level: 3, label: 'Intermediário' },
  { level: 4, label: 'Ruim' },
  { level: 5, label: 'Péssimo' },
]

const emit = defineEmits(['close'])

const openModal = async () => {
  isVisible.value = true
  await fetchIndicatorLevel()
}

const closeModal = () => {
  isVisible.value = false
  emit('close')
}

const fetchIndicatorLevel = async () => {
  isLoading.value = true
  try {
    const response = await levelsServices.getByIndicatorId(props.selectedIndicator.id.toString())
    levelList.value = Array.isArray(response.data) ? response.data : [response.data]
  } catch (err) {
    console.error('Erro ao buscar níveis:', err)
  } finally {
    isLoading.value = false
  }
}

const getLevelLabel = (level: number) => {
  const found = levels.find((l) => l.level === level)
  return found ? found.label : ''
}

const getLevelColor = (level: number) => {
  const colors: Record<number, string> = {
    1: '#059669',
    2: '#16a34a',
    3: '#d97706',
    4: '#dc2626',
    5: '#7f1d1d',
  }
  return colors[level] || 'grey'
}

const selectedIndicator = computed(() => props.selectedIndicator)

const modalTitle = computed(() => {
  return `Níveis do indicador: ${selectedIndicator.value.name}`
})

defineExpose({
  openModal,
})
</script>

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
        <v-card v-if="!isLoading && levelList && !!levelList.length" class="mobility-levels-modal__card">
          <v-list class="mobility-levels-modal__levels-list">
            <v-list-item
              v-for="levelItem in levelList"
              :key="levelItem.id"
              :class="`level-item level-${levelItem.level}`"
            >
              <template v-slot:prepend>
                <v-avatar :color="getLevelColor(levelItem.level)" size="40">
                  {{ levelItem.level }}
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-bold">
                Nível {{ levelItem.level }} - {{ getLevelLabel(levelItem.level) }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>

        <div v-else-if="isLoading" class="text-center py-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p class="mt-2">Carregando níveis...</p>
        </div>

        <v-alert v-else type="info" variant="outlined"> Nenhum nível encontrado para este indicador. </v-alert>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

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

  &__card {
    box-shadow: none;
  }

  &__levels-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0;

    .level-item {
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(0.99);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      &.level-1 {
        background: linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 100%);
        border-left: 4px solid #059669;
      }

      &.level-2 {
        background: linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%);
        border-left: 4px solid #16a34a;
      }

      &.level-3 {
        background: linear-gradient(135deg, #fffbeb 0%, #fed7aa 100%);
        border-left: 4px solid #d97706;
      }

      &.level-4 {
        background: linear-gradient(135deg, #fef2f2 0%, #fca5a5 100%);
        border-left: 4px solid #dc2626;
      }

      &.level-5 {
        background: linear-gradient(135deg, #fef2f2 0%, #f87171 100%);
        border-left: 4px solid #7f1d1d;
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
