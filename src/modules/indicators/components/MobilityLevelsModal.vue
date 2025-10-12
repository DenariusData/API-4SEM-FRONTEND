<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>Critérios e Níveis de Mobilidade</h2>
        <button @click="closeModal" class="close-btn">
          ×
        </button>
      </div>
      <div class="modal-content">
        <div class="levels-legend">
          <h3>Legenda dos Níveis</h3>
          <div class="levels-grid">
            <div
              v-for="level in levels"
              :key="level.level"
              :class="`level-card level-${level.level}`"
              @click="showLevelDetails(level)"
            >
              <span class="level-number">{{ level.level }}</span>
              <span class="level-label">{{ level.label }}</span>
            </div>
          </div>
        </div>

        <div class="criteria-section">
          <div
            v-for="(criterion, index) in criteria"
            :key="index"
            class="criterion-card"
          >
            <div
              class="criterion-header"
              @click="toggleCriterion(index)"
            >
              <h3>{{ criterion.name }}</h3>
              <span :class="['arrow', { 'expanded': expandedCriteria[index] }]">▼</span>
            </div>

            <div v-if="expandedCriteria[index]" class="criterion-content">
              <div class="criterion-description">
                <strong>Finalidade:</strong> {{ criterion.purpose }}
              </div>

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
                    <tr
                      v-for="range in criterion.ranges"
                      :key="range.level"
                      :class="`level-${range.level}`"
                    >
                      <td>{{ range.level }}</td>
                      <td>{{ range.range }}</td>
                      <td>{{ getLevelLabel(range.level) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="criterion.example" class="example">
                <strong>Exemplo:</strong> {{ criterion.example }}
              </div>

              <div v-if="criterion.nullValue" class="null-value">
                <strong>Valor NULL:</strong> {{ criterion.nullValue }}
              </div>

              <div v-if="criterion.details" class="details">
                <strong>Detalhamento:</strong>
                <p v-html="criterion.details.replace(/\n/g, '<br>')"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>


  <div v-if="levelModalVisible" class="level-modal-overlay" @click="closeLevelModal">
    <div class="level-modal-container" @click.stop>
      <div class="level-modal-header" :class="`level-${selectedLevel?.level}`">
        <div class="level-info">
          <span class="level-number-large">{{ selectedLevel?.level }}</span>
          <div class="level-text">
            <h3>Nível {{ selectedLevel?.level }}</h3>
            <p>{{ selectedLevel?.label }}</p>
          </div>
        </div>
        <button @click="closeLevelModal" class="level-close-btn">
          ×
        </button>
      </div>
      <div class="level-modal-content">
        <div class="level-description">
          <h4>O que significa este nível?</h4>
          <p>Este nível indica uma situação <strong>{{ selectedLevel?.label.toLowerCase() }}</strong> no trânsito urbano.</p>
          <p>Todos os critérios de mobilidade utilizam essa classificação para determinar a condição das vias monitoradas.</p>
        </div>

        <div class="level-ranges">
          <h4>Faixas de Classificação</h4>
          <p>Dependendo do critério analisado, este nível pode representar diferentes faixas de valores:</p>
          <ul>
            <li><strong>Congestionamento e Densidade:</strong> {{ getLevelRangeForCongestion(selectedLevel?.level) }}</li>
            <li><strong>Veículos de Grande Porte:</strong> {{ getLevelRangeForVehicles(selectedLevel?.level) }}</li>
            <li><strong>Infrações de Velocidade:</strong> {{ getLevelRangeForInfractions(selectedLevel?.level) }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'

interface ExpandedCriteriaState {
  [criterionIndex: number]: boolean
}

interface MobilityLevel {
  level: number
  label: string
}

interface CriterionRange {
  level: number
  range: string
}

interface MobilityCriterion {
  name: string
  purpose: string
  ranges: CriterionRange[]
  details: string
  example: string
  nullValue: string
}

const isVisible = ref(false)
const expandedCriteria = ref<ExpandedCriteriaState>({})
const levelModalVisible = ref(false)
const selectedLevel = ref<MobilityLevel | null>(null)

const levels: MobilityLevel[] = [
  { level: 1, label: 'Excelente' },
  { level: 2, label: 'Bom' },
  { level: 3, label: 'Intermediário' },
  { level: 4, label: 'Ruim' },
  { level: 5, label: 'Péssimo' }
]

const criteria: MobilityCriterion[] = [
  {
    name: '1. Congestionamento',
    purpose: 'Identificar lentidão em uma via. Quanto maior a porcentagem, menor a fluidez dos veículos na via.',
    ranges: [
      { level: 1, range: '0% – 19,9%' },
      { level: 2, range: '20% – 39,9%' },
      { level: 3, range: '40% – 59,9%' },
      { level: 4, range: '60% – 79,9%' },
      { level: 5, range: '80% – 100%' }
    ],
    details: `Média de "velocidade relativa" utilizando valores de veículos que passaram na via em uma janela de tempo dos últimos 20 segundos. Esse índice será atualizado a cada 1 segundo.

Velocidade relativa = (1 - (velocidade média / velocidade permitida)) * 100%

Congestionamento = somatória da "velocidade relativa" de todos veículos que passaram na via na janela de tempo / quantidade de veículos na janela de tempo`,
    example: 'Av. Paraibuna, limite: 70 km/h; velocidade do veículo: 45 km/h → velocidade relativa: 35,7% → Nível 2',
    nullValue: 'NULL → Não confiável'
  },
  {
    name: '2. Densidade relativa de veículos por câmera',
    purpose: 'Identificar lentidão em uma via. Quanto maior a densidade de veículos por câmera, menor a fluidez dos veículos na via, maior o desgaste da pista e maior o risco de acidentes.',
    ranges: [
      { level: 1, range: '0% – 19,9%' },
      { level: 2, range: '20% – 39,9%' },
      { level: 3, range: '40% – 59,9%' },
      { level: 4, range: '60% – 79,9%' },
      { level: 5, range: '80% – 100%' }
    ],
    details: `Cálculo da porcentagem de ocupação de espaço de veículos em uma janela de tempo dos últimos 20 segundos pelo espaço disponível da via, definida pela visão do radar. Esse índice será atualizado a cada 1 segundo.

Os ônibus não estão incluídos nesse cálculo pois é esperado que em horários de pico a prefeitura e empresas disponibilizem uma grande quantidade destes veículos, o que levaria a falsos alertas.

Consideração de espaço ocupado para cada tipo de veículo:
• Carro: 4,5 metros
• Moto: 3 metros
• Caminhão Grande: 12 metros
• Van: 6 metros
• Camionete: 6,5 metros

Janela de tempo = 20 segundos
Espaço ocupado = somatória de comprimento médio + espaço de segurança de todos veículos detectados na "Janela de tempo"
Visão do radar = 50 metros
Espaço disponível = "Visão do radar" × número de faixas
Densidade = ("Espaço ocupado" / "Espaço disponível") × 100%`,
    example: 'Câmera A em via de 2 faixas, com 8 carros, 2 caminhões grandes e 1 van, espaço disponível: 100 metros; espaço ocupado: 66 metros → 66% → Nível 4',
    nullValue: 'NULL → Sem dados'
  },
  {
    name: '3. Circulação de veículos de grande porte',
    purpose: 'Identificar de forma "micro" uma das causas de congestionamento. Quanto maior a quantidade de veículos de grande porte, maior a chance de congestionamento, desgaste da pista e risco de acidentes.',
    ranges: [
      { level: 1, range: '0% – 4,9%' },
      { level: 2, range: '5% – 9,9%' },
      { level: 3, range: '10% – 14,9%' },
      { level: 4, range: '15% – 19,9%' },
      { level: 5, range: '20%+' }
    ],
    details: `Cálculo da porcentagem dos veículos de grande porte pela quantidade total de veículos da via em uma janela de tempo dos últimos 20 segundos. Esse índice será atualizado a cada 1 segundo.

Veículos de grande porte são van, camionete e caminhão grande. Os ônibus não estão incluídos nesse cálculo pois é esperado que em horários de pico a prefeitura e empresas disponibilizem uma grande quantidade destes veículos, o que levaria a falsos alertas.

Porcentagem de veículos de grande porte = (quantidade de veículos de grande porte / quantidade de veículos na via) × 100%`,
    example: 'Av. Florestan Fernandes, Caminhão Grande: 10%; Van: 6%; Total de 16% → Nível 4',
    nullValue: 'NULL → Sem dados'
  },
  {
    name: '4. Infrações por excesso de velocidade',
    purpose: 'Identificar vias propensas a acidentes, para que o gestor possa tomar as ações adequadas para redução de infrações na via observada. Quanto maior a quantidade de infrações da via, maior o risco de acidentes e, consequentemente, de congestionamento.',
    ranges: [
      { level: 1, range: '0% – 4,9%' },
      { level: 2, range: '5% – 9,9%' },
      { level: 3, range: '10% – 19,9%' },
      { level: 4, range: '20% – 34,9%' },
      { level: 5, range: '35%+' }
    ],
    details: `Contador da quantidade de veículos que ultrapassam em pelo menos 20% acima da velocidade permitida da via nas últimas 24 horas. Esse índice será atualizado a cada 60 segundos.

Quantidade de infrações da via = (veículos únicos infracionários das últimas 24 horas / total de veículos únicos das últimas 24 horas) × 100%`,
    example: 'Av. Dr. Nelson D\'Ávila – 38% de infrações nas últimas 24h → Nível 5',
    nullValue: 'NULL → Sem dados'
  }
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

const toggleCriterion = (index: number) => {
  expandedCriteria.value[index] = !expandedCriteria.value[index]
}

const showLevelDetails = (level: MobilityLevel) => {
  selectedLevel.value = level
  levelModalVisible.value = true
}

const closeLevelModal = () => {
  levelModalVisible.value = false
  selectedLevel.value = null
}

const getLevelRangeForCongestion = (level?: number) => {
  if (!level) return 'N/A'
  const ranges = ['0% – 19,9%', '20% – 39,9%', '40% – 59,9%', '60% – 79,9%', '80% – 100%']
  return ranges[level - 1] || 'N/A'
}

const getLevelRangeForVehicles = (level?: number) => {
  if (!level) return 'N/A'
  const ranges = ['0% – 4,9%', '5% – 9,9%', '10% – 14,9%', '15% – 19,9%', '20%+']
  return ranges[level - 1] || 'N/A'
}

const getLevelRangeForInfractions = (level?: number) => {
  if (!level) return 'N/A'
  const ranges = ['0% – 4,9%', '5% – 9,9%', '10% – 19,9%', '20% – 34,9%', '35%+']
  return ranges[level - 1] || 'N/A'
}

const getLevelLabel = (level: number) => {
  const found = levels.find(l => l.level === level)
  return found ? found.label : ''
}

onBeforeUnmount(() => {
  document.body.style.overflow = 'auto'
})

defineExpose({
  openModal
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
  overflow-y: auto;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
  animation: modalAppear 0.3s ease-out;
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

.levels-legend {
  margin-bottom: 32px;
}

.levels-legend h3 {
  margin: 0 0 20px 0;
  color: #1f2937;
  font-size: 1.3rem;
  font-weight: 600;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.level-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  font-weight: 500;
  color: white;
  text-align: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.level-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.level-1 { background: linear-gradient(135deg, #10b981, #059669); }
.level-2 { background: linear-gradient(135deg, #22c55e, #16a34a); }
.level-3 { background: linear-gradient(135deg, #f59e0b, #d97706); }
.level-4 { background: linear-gradient(135deg, #ef4444, #dc2626); }
.level-5 { background: linear-gradient(135deg, #991b1b, #7f1d1d); }

.level-number {
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 10px;
  border-radius: 50%;
  font-size: 0.95rem;
  font-weight: 600;
}

.criterion-card {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.criterion-header {
  padding: 20px;
  background: #f9fafb;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}

.criterion-header:hover {
  background: #f3f4f6;
}

.criterion-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.2rem;
  font-weight: 600;
}

.arrow {
  color: #6b7280;
  transition: transform 0.2s;
  font-size: 14px;
}

.arrow.expanded {
  transform: rotate(180deg);
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

.ranges-table tr.level-1 td { background: rgba(16, 185, 129, 0.08); }
.ranges-table tr.level-2 td { background: rgba(34, 197, 94, 0.08); }
.ranges-table tr.level-3 td { background: rgba(245, 158, 11, 0.08); }
.ranges-table tr.level-4 td { background: rgba(239, 68, 68, 0.08); }
.ranges-table tr.level-5 td { background: rgba(153, 27, 27, 0.08); }

.example, .details, .null-value {
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

  .levels-grid {
    grid-template-columns: 1fr 1fr;
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
  .levels-grid {
    grid-template-columns: 1fr;
  }

  .modal-header {
    padding: 20px;
  }

  .modal-content {
    padding: 20px;
  }
}


.level-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 20px;
  backdrop-filter: blur(8px);
}

.level-modal-container {
  background: white;
  border-radius: 12px;
  max-width: 280px;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  animation: levelModalAppear 0.25s ease-out;
}

@keyframes levelModalAppear {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.level-modal-header {
  padding: 16px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1;
}

.level-number-large {
  font-size: 1.8rem;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.2);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.level-text h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.level-text p {
  display: none;
}

.level-close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  transition: all 0.2s ease;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  line-height: 1;
}

.level-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1) rotate(90deg);
}

.level-modal-content {
  padding: 16px;
  text-align: center;
}

.level-description {
  margin: 0;
  padding: 0;
  background: none;
  border: none;
}

.level-description h4 {
  display: none;
}

.level-description p {
  margin: 0 0 12px 0;
  color: #4b5563;
  line-height: 1.4;
  font-size: 0.9rem;
}

.level-ranges {
  display: none;
}

.level-ranges li:last-child {
  border-bottom: none;
}

@media (max-width: 480px) {
  .level-modal-container {
    margin: 10px;
    border-radius: 20px;
  }

  .level-modal-header {
    padding: 24px;
  }

  .level-info {
    gap: 16px;
  }

  .level-number-large {
    font-size: 2.5rem;
    width: 60px;
    height: 60px;
  }

  .level-text h3 {
    font-size: 1.5rem;
  }

  .level-modal-content {
    padding: 24px;
  }
}
</style>
