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
  <div class="indicators-container">
    <div class="panel-header">
      <div>
        <h2>Indicadores</h2>
        <p>Lista de todos os indicadores de mobilidade urbana</p>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <p>Carregando indicadores...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <span class="error-icon">⚠</span>
      <p>{{ error }}</p>
    </div>

    <div v-else-if="indicators.length === 0" class="empty-state">
      <span class="empty-icon">📊</span>
      <p>Nenhum indicador encontrado</p>
    </div>

    <div v-else class="items-grid">
      <div v-for="(indicator, index) in indicators" :key="indicator.id" class="item-card">
        <div class="item-content">
          <div class="item-main">
            <div class="item-header-row">
              <h3>{{ index + 1 }}. {{ indicator.name }}</h3>
            </div>
            <p class="item-description">{{ indicator.description }}</p>
            <div class="item-details">
              <div class="detail-box example-box"><strong>Exemplo:</strong> {{ indicator.example }}</div>
              <div class="detail-box formula-box"><strong>Fórmula:</strong> {{ indicator.mathExpression }}</div>
            </div>
          </div>
          <div class="item-actions">
            <button @click="showMobilityLevels(indicator)" class="btn btn-primary">Ver Detalhes</button>
          </div>
        </div>
      </div>
    </div>

    <MobilityLevelsModal v-if="selectedIndicator" ref="mobilityModal" :selected-indicator="selectedIndicator" />
  </div>
</template>

<style lang="scss" scoped>
.indicators-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 20px;

  h2 {
    font-size: 1.5rem;
    color: #1f2937;
    margin: 0 0 4px 0;
    font-weight: 600;
  }

  p {
    font-size: 0.9rem;
    color: #6b7280;
    margin: 0;
  }
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  border-radius: 8px;
  border: 2px dashed #e5e7eb;

  p {
    color: #6b7280;
    margin: 8px 0;
    font-size: 1rem;
  }
}

.loading-state {
  background: #f9fafb;
}

.error-state {
  background: #fef2f2;
  border-color: #fecaca;

  .error-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 16px;
    color: #dc2626;
  }

  p {
    color: #dc2626;
  }
}

.empty-state {
  background: #f9fafb;

  .empty-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 16px;
  }
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.item-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #d1d5db;
  }

  .item-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
  }

  .item-main {
    flex: 1;
  }

  .item-header-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  h3 {
    font-size: 1.15rem;
    color: #1f2937;
    margin: 0;
    font-weight: 600;
  }

  .item-description {
    font-size: 0.9rem;
    color: #6b7280;
    margin: 6px 0 16px 0;
    line-height: 1.6;
  }

  .item-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .detail-box {
    padding: 12px;
    border-radius: 6px;
    font-size: 0.85rem;
    line-height: 1.5;

    strong {
      color: inherit;
      margin-right: 4px;
    }
  }

  .example-box {
    background: #f0f9ff;
    border: 1px solid #bfdbfe;
    color: #1e40af;
  }

  .formula-box {
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    color: #374151;
  }

  .item-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: auto;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &-primary {
    background: linear-gradient(135deg, #00c853 0%, #00963e 100%);
    color: white;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 150, 62, 0.3);
    }
  }
}

@media (max-width: 768px) {
  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .items-grid {
    grid-template-columns: 1fr;
  }

  .item-card {
    .item-actions {
      justify-content: stretch;

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  }
}
</style>
