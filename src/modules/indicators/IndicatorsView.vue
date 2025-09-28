<template>
  <div class="indicators-view">
    <div class="page-header">
      <h1>Indicadores de Mobilidade</h1>
      <p>Visualize e compreenda os critérios e níveis de mobilidade urbana</p>
    </div>

    <div class="quick-stats">
      <h2>Níveis de Classificação</h2>
      <div class="stats-grid">
        <div class="stat-card level-1" @click="showMobilityLevels">
          <div class="stat-number">1</div>
          <div class="stat-label">Excelente</div>
          <div class="stat-desc">0% - 19,9%</div>
        </div>
        <div class="stat-card level-2" @click="showMobilityLevels">
          <div class="stat-number">2</div>
          <div class="stat-label">Bom</div>
          <div class="stat-desc">20% - 39,9%</div>
        </div>
        <div class="stat-card level-3" @click="showMobilityLevels">
          <div class="stat-number">3</div>
          <div class="stat-label">Intermediário</div>
          <div class="stat-desc">40% - 59,9%</div>
        </div>
        <div class="stat-card level-4" @click="showMobilityLevels">
          <div class="stat-number">4</div>
          <div class="stat-label">Ruim</div>
          <div class="stat-desc">60% - 79,9%</div>
        </div>
        <div class="stat-card level-5" @click="showMobilityLevels">
          <div class="stat-number">5</div>
          <div class="stat-label">Péssimo</div>
          <div class="stat-desc">80% - 100%</div>
        </div>
      </div>
    </div>

    <div class="indicators-grid">
      <div class="indicator-card" @click="showMobilityLevels">
        <div class="card-content">
          <h3>1. Congestionamento</h3>
          <p>Identifica lentidão em uma via. Quanto maior a porcentagem, menor a fluidez dos veículos.</p>
          <div class="card-example">
            <strong>Exemplo:</strong> Av. Paraibuna, limite: 70 km/h; velocidade: 45 km/h → 35,7% → Nível 2
          </div>
          <span class="view-btn">Ver Detalhes</span>
        </div>
      </div>

      <div class="indicator-card" @click="showMobilityLevels">
        <div class="card-content">
          <h3>2. Densidade de Veículos</h3>
          <p>Monitoramento da ocupação de espaço por câmeras. Maior densidade = menor fluidez.</p>
          <div class="card-example">
            <strong>Exemplo:</strong> Via de 2 faixas, 8 carros, 2 caminhões, 1 van → 66% → Nível 4
          </div>
          <span class="view-btn">Ver Detalhes</span>
        </div>
      </div>

      <div class="indicator-card" @click="showMobilityLevels">
        <div class="card-content">
          <h3>3. Veículos de Grande Porte</h3>
          <p>Análise da circulação de caminhões, vans e camionetes nas vias.</p>
          <div class="card-example">
            <strong>Exemplo:</strong> Av. Florestan Fernandes - Caminhões: 10%, Vans: 6% → 16% → Nível 4
          </div>
          <span class="view-btn">Ver Detalhes</span>
        </div>
      </div>

      <div class="indicator-card" @click="showMobilityLevels">
        <div class="card-content">
          <h3>4. Infrações de Velocidade</h3>
          <p>Monitoramento de excesso de velocidade para prevenção de acidentes.</p>
          <div class="card-example">
            <strong>Exemplo:</strong> Av. Dr. Nelson D'Ávila – 38% de infrações nas últimas 24h → Nível 5
          </div>
          <span class="view-btn">Ver Detalhes</span>
        </div>
      </div>
    </div>

    <MobilityLevelsModal
      ref="mobilityModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MobilityLevelsModal from './MobilityLevelsModal.vue'

interface ModalRef {
  openModal: () => void
}

const mobilityModal = ref<ModalRef | null>(null)

const showMobilityLevels = () => {
  mobilityModal.value?.openModal()
}

</script>

<style lang="scss" scoped>
.indicators-view {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
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

.quick-stats {
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;

  h2 {
    text-align: center;
    color: #1f2937;
    margin-bottom: 24px;
    font-size: 1.8rem;
    font-weight: 600;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 28px;
  text-align: center;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  }
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px auto;
}

.stat-label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151;
  font-size: 1.1rem;
}

.stat-desc {
  font-size: 0.95rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-card.level-1 .stat-number {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
}
.stat-card.level-2 .stat-number {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.3);
}
.stat-card.level-3 .stat-number {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.3);
}
.stat-card.level-4 .stat-number {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
}
.stat-card.level-5 .stat-number {
  background: linear-gradient(135deg, #991b1b, #7f1d1d);
  box-shadow: 0 6px 16px rgba(153, 27, 27, 0.3);
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
</style>
