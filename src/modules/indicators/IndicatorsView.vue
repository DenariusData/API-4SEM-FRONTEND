<script setup lang="ts">
import LevelsDisplay from '@/modules/indicators/components/LevelsDisplay.vue'
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

const showMobilityLevels = () => {
  mobilityModal.value?.openModal()
}

onMounted(() => {
  fetchIndicators()
})
</script>

<template>
  <div class="indicators-view">
    <div class="page-header">
      <h1>Indicadores de Mobilidade</h1>
      <p>Visualize e compreenda os critérios e níveis de mobilidade urbana</p>
    </div>

    <LevelsDisplay />

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
        @click="showMobilityLevels"
      >
        <div class="card-content">
          <h3>{{ index + 1 }}. {{ indicator.name }}</h3>
          <p>{{ indicator.description }}</p>
          <div class="card-example">
            <strong>Exemplo:</strong>
            <span v-if="indicator.name === 'Congestionamento'">
              Av. Paraibuna, limite: 70 km/h; velocidade: 45 km/h → 35,7% → Nível 2
            </span>
            <span v-else-if="indicator.name === 'Densidade de Veículos'">
              Via de 2 faixas, 8 carros, 2 caminhões, 1 van → 66% → Nível 4
            </span>
            <span v-else-if="indicator.name === 'Veículos de Grande Porte'">
              Av. Florestan Fernandes - Caminhões: 10%, Vans: 6% → 16% → Nível 4
            </span>
            <span v-else-if="indicator.name === 'Infrações de Velocidade'">
              Av. Dr. Nelson D'Ávila – 38% de infrações nas últimas 24h → Nível 5
            </span>
          </div>
          <span class="view-btn">Ver Detalhes</span>
        </div>
      </div>
    </div>

    <MobilityLevelsModal ref="mobilityModal" />
  </div>
</template>

<style lang="scss" scoped>
.indicators-view {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 24px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 20px;

  h1 {
    font-size: 2.5rem;
    color: #4d4d4d;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #00c853 0%, #00963e 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 700;
  }

  p {
    font-size: 1.1rem;
    color: #6b7280;
    margin: 0;
  }
}

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

@media (max-width: 768px) {
  .indicators-view {
    padding: 16px;
    gap: 24px;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .indicators-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-stats {
    padding: 24px;
  }

  .indicator-card {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .indicator-card {
    padding: 20px;
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
</style>
