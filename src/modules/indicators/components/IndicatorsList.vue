<script setup lang="ts">
import MobilityLevelsModal from '@/modules/indicators/components/modals/MobilityLevelsModal.vue'
import indicatorsServices from '@/modules/indicators/services/indicatorsServices'
import type { Indicator } from '@/modules/indicators/types/indicatorsTypes'
import { ref, onMounted } from 'vue'

interface ModalRef {
  openModal: () => void
}

const mobilityModal = ref<ModalRef | null>(null)
const indicators = ref<Indicator[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const selectedIndicator = ref<Indicator | null>(null)

const fetchIndicators = async () => {
  try {
    isLoading.value = true
    error.value = null
    const response = await indicatorsServices.get()
    indicators.value = response.data.items
  } catch (err) {
    error.value = 'Erro ao carregar indicadores'
    console.error('Erro ao buscar indicadores:', err)
  } finally {
    isLoading.value = false
  }
}

const showMobilityLevels = (indicator: Indicator) => {
  selectedIndicator.value = indicator
  mobilityModal.value?.openModal()
}

onMounted(() => {
  fetchIndicators()
})
</script>

<template>
  <div class="indicators-grid">
    <div v-if="isLoading" class="loading-message">Carregando indicadores...</div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div
      v-else
      v-for="(indicator, index) in indicators"
      :key="indicator.id"
      class="indicator-card"
      @click="showMobilityLevels(indicator)"
    >
      <div class="card-content">
        <h3>{{ index + 1 }}. {{ indicator.name }}</h3>
        <p>{{ indicator.description }}</p>
        <div class="card-example"><strong>Exemplo:</strong> {{ indicator.example }}</div>
        <span class="view-btn">Ver Detalhes</span>
      </div>
    </div>

    <MobilityLevelsModal ref="mobilityModal" :selected-indicator="selectedIndicator" />
  </div>
</template>

<style lang="scss" scoped>
.indicators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 28px;
}

.indicator-card {
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
  overflow: hidden;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
    border-color: #00c853;
  }
}

.card-content {
  h3 {
    font-size: 1.5rem;
    color: #1f2937;
    margin: 0 0 16px 0;
    font-weight: 600;
  }

  p {
    color: #6b7280;
    margin: 0 0 20px 0;
    line-height: 1.6;
    font-size: 1.05rem;
  }
}

.card-example {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f7fa 100%);
  border: 1px solid #bfdbfe;
  border-radius: 16px;
  padding: 16px;
  margin: 20px 0;
  font-size: 0.95rem;
  color: #1e40af;
  line-height: 1.6;
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.1);
}

.view-btn {
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

.loading-message,
.error-message {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 500;
}

.loading-message {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f7fa 100%);
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.error-message {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc2626;
  border: 1px solid #fecaca;
}

@media (max-width: 768px) {
  .indicators-grid {
    grid-template-columns: 1fr;
  }

  .indicator-card {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .indicator-card {
    padding: 20px;
  }
}
</style>
