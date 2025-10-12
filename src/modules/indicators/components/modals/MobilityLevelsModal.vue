<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>{{ modalTitle }}</h2>
        <button @click="closeModal" class="close-btn">×</button>
      </div>
      <div v-for="(indicator, index) in filteredCriteria" :key="index" class="criterion-card">
        <div class="criterion-content">
          <div class="criterion-description"><strong>Finalidade:</strong> {{ indicator.purpose }}</div>

          <div class="ranges-table">
            <table>
              <thead>
                <tr>
                  <th>Nível</th>
                  <th>Faixa</th>
                  <th>Classificação</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="range in indicator.ranges" :key="range.level" :class="`level-${range.level}`">
                  <td>{{ range.level }}</td>
                  <td>{{ range.range }}</td>
                  <td>{{ getLevelLabel(range.level) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="indicator.example" class="example"><strong>Exemplo:</strong> {{ indicator.example }}</div>

          <div v-if="indicator.nullValue" class="null-value">
            <strong>Valor NULL:</strong> {{ indicator.nullValue }}
          </div>

          <div v-if="indicator.details" class="details">
            <strong>Detalhamento:</strong>
            <p v-html="indicator.details.replace(/\n/g, '<br>')"></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, computed } from 'vue'
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
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isVisible.value = false
  document.body.style.overflow = 'auto'
  emit('close')
}

const getLevelLabel = (level: number) => {
  const found = levels.find((l) => l.level === level)
  return found ? found.label : ''
}

const filteredCriteria = computed(() => {
  if (!props.selectedIndicator) {
    return []
  }

  return [props.selectedIndicator]
})

const modalTitle = computed(() => {
  if (props.selectedIndicator) {
    return `Critério: ${props.selectedIndicator.name}`
  }
  return 'Critérios e Níveis de Mobilidade'
})

onBeforeUnmount(() => {
  document.body.style.overflow = 'auto'
})

defineExpose({
  openModal,
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 20px;
  max-width: 850px;
  max-height: 90vh;
  width: 100%;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
  animation: modalAppear 0.3s ease-out;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  padding: 32px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #00c853 0%, #00963e 100%);
  color: white;
  border-radius: 20px 20px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 12px;
  border-radius: 50%;
  transition: all 0.2s;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  line-height: 1;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.modal-content {
  padding: 32px;
}

.criterion-card {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.criterion-header {
  padding: 20px 24px 16px 24px;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.criterion-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.2rem;
  font-weight: 600;
}

.criterion-content {
  padding: 24px;
}

.criterion-description {
  margin-bottom: 24px;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 12px;
  color: #1f2937;
  border-left: 4px solid #00c853;
  line-height: 1.6;
}

.ranges-table {
  margin: 24px 0;
}

.ranges-table table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.ranges-table th {
  background: #374151;
  color: white;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  font-size: 1rem;
}

.ranges-table td {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 500;
}

.ranges-table tr.level-1 {
  background: linear-gradient(135deg, #10b981, #059669);
}
.ranges-table tr.level-2 {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}
.ranges-table tr.level-3 {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}
.ranges-table tr.level-4 {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}
.ranges-table tr.level-5 {
  background: linear-gradient(135deg, #991b1b, #7f1d1d);
}

.example,
.details,
.null-value {
  margin-top: 20px;
  padding: 16px;
  border-radius: 12px;
  line-height: 1.6;
}

.example {
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
}

.details {
  background: #f0f9ff;
  border-left: 4px solid #0ea5e9;
}

.null-value {
  background: #fef2f2;
  border-left: 4px solid #ef4444;
}

.details p {
  margin: 12px 0 0 0;
  color: #374151;
  line-height: 1.7;
}

@media (max-width: 768px) {
  .modal-container {
    margin: 10px;
    max-height: 95vh;
    border-radius: 16px;
  }

  .modal-header {
    padding: 24px;
    border-radius: 16px 16px 0 0;
  }

  .modal-header h2 {
    font-size: 1.4rem;
  }

  .modal-content {
    padding: 24px;
  }

  .ranges-table {
    overflow-x: auto;
  }

  .criterion-header {
    padding: 16px;
  }

  .criterion-content {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .modal-header {
    padding: 20px;
  }

  .modal-content {
    padding: 20px;
  }
}
</style>
