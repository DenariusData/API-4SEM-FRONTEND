<script setup lang="ts">
import MobilityLevelsModal from '@/modules/indicators/components/modals/MobilityLevelsModal.vue'
import indicatorsServices from '@/modules/indicators/services/indicatorsServices'
import type { Indicator } from '@/modules/indicators/types/indicatorsTypes'
import { ref, onMounted, nextTick } from 'vue'

interface ModalRef {
  openModal: () => void
}

const mobilityModal = ref<ModalRef | null>(null)
const indicators = ref<Indicator[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const selectedIndicator = ref<Indicator | null>(null)

const fetchIndicators = async () => {
  isLoading.value = true
  try {
    error.value = null
    const response = await indicatorsServices.get()
    indicators.value = response.data
  } catch (err) {
    error.value = 'Erro ao carregar indicadores'
    console.error('Erro ao buscar indicadores:', err)
  } finally {
    isLoading.value = false
  }
}

const showMobilityLevels = (indicator: Indicator) => {
  selectedIndicator.value = indicator
  nextTick(() => {
    mobilityModal.value?.openModal()
  })
}

onMounted(() => {
  fetchIndicators()
})
</script>

<template>
  <div class="indicators-list">
    <div v-if="isLoading" class="indicators-list__loading">Carregando indicadores...</div>

    <div v-else-if="error" class="indicators-list__error">
      {{ error }}
    </div>

    <div v-else v-for="(indicator, index) in indicators" :key="indicator.id" class="indicators-list__card">
      <div class="indicators-list__content">
        <h3 class="indicators-list__title">{{ index + 1 }}. {{ indicator.name }}</h3>
        <div class="indicators-list__details">
          <p class="indicators-list__description">{{ indicator.description }}</p>
          <div class="indicators-list__example"><strong>Exemplo:</strong> {{ indicator.example }}</div>
          <div class="indicators-list__math"><strong>Fórmula:</strong> {{ indicator.mathExpression }}</div>
        </div>
        <button class="indicators-list__btn" @click="showMobilityLevels(indicator)">Ver Detalhes</button>
      </div>
    </div>

    <MobilityLevelsModal v-if="selectedIndicator" ref="mobilityModal" :selected-indicator="selectedIndicator" />
  </div>
</template>

<style lang="scss" scoped>
.indicators-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 28px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  &__card {
    background: white;
    border-radius: 24px;
    padding: 32px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    cursor: pointer;
    border: 2px solid transparent;
    overflow: hidden;

    &:hover {
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
      border-color: #00c853;
    }

    @media (max-width: 768px) {
      padding: 24px;
    }

    @media (max-width: 480px) {
      padding: 20px;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 24px;
    height: 100%;
  }

  &__title {
    font-size: 1.5rem;
    color: #1f2937;
    font-weight: 600;
  }

  &__details {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 12px;
    flex-grow: 1;
  }

  &__description {
    color: #6b7280;
    line-height: 1.6;
    font-size: 1.05rem;
  }

  &__example,
  &__math {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f7fa 100%);
    border: 1px solid #bfdbfe;
    border-radius: 16px;
    padding: 16px;
    font-size: 0.95rem;
    color: #1e40af;
    line-height: 1.6;
    box-shadow: 0 2px 8px rgba(30, 64, 175, 0.1);
  }

  &__math {
    background: linear-gradient(135deg, #f4f4f4 0%, #e0e0e0 100%);
    border: 1px solid #bdbdbd;
    color: #4d4d4d;
    box-shadow: 0 2px 8px rgba(77, 77, 77, 0.1);
  }

  &__btn {
    display: inline-block;
    background: linear-gradient(135deg, #00c853 0%, #00963e 100%);
    color: white;
    padding: 14px 28px;
    border-radius: 16px;
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    box-shadow: 0 6px 16px rgba(0, 200, 83, 0.3);
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 200, 83, 0.4);
    }
  }

  &__loading,
  &__error {
    grid-column: 1 / -1;
    text-align: center;
    padding: 40px;
    border-radius: 16px;
    font-size: 1.1rem;
    font-weight: 500;
  }

  &__loading {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f7fa 100%);
    color: #1e40af;
    border: 1px solid #bfdbfe;
  }

  &__error {
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    color: #dc2626;
    border: 1px solid #fecaca;
  }
}
</style>
