<script setup lang="ts">
import LevelDescriptionModal from '@/modules/indicators/components/modals/LevelDescriptionModal.vue'
import { ref } from 'vue'
import { LEVELS_ENUM, type LevelKey, type SelectedLevel } from '@/modules/indicators/enums'

const isLevelModalOpened = ref(false)
const selectedLevel = ref<SelectedLevel>({
  value: 1,
  name: 'Excelente',
})
const levelModalRef = ref<InstanceType<typeof LevelDescriptionModal> | null>(null)

const showLevelDescription = (level: LevelKey) => {
  selectedLevel.value = {
    value: level,
    name: LEVELS_ENUM[level],
  }
  levelModalRef.value?.openModal()
}
</script>

<template>
  <div class="quick-stats">
    <h2>Níveis de Classificação</h2>
    <div class="stats-grid">
      <div class="stat-card level-1" @click="showLevelDescription(1 as LevelKey)">
        <div class="stat-number">1</div>
        <div class="stat-label">Excelente</div>
      </div>
      <div class="stat-card level-2" @click="showLevelDescription(2 as LevelKey)">
        <div class="stat-number">2</div>
        <div class="stat-label">Bom</div>
      </div>
      <div class="stat-card level-3" @click="showLevelDescription(3 as LevelKey)">
        <div class="stat-number">3</div>
        <div class="stat-label">Intermediário</div>
      </div>
      <div class="stat-card level-4" @click="showLevelDescription(4 as LevelKey)">
        <div class="stat-number">4</div>
        <div class="stat-label">Ruim</div>
      </div>
      <div class="stat-card level-5" @click="showLevelDescription(5 as LevelKey)">
        <div class="stat-number">5</div>
        <div class="stat-label">Péssimo</div>
      </div>
    </div>
  </div>
  <LevelDescriptionModal ref="levelModalRef" :selected-level="selectedLevel" @close="isLevelModalOpened = false" />
</template>

<style lang="scss" scoped>
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
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;

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
    }
    .level-1 .stat-number {
      background: linear-gradient(135deg, #10b981, #059669);
      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
    }
    .level-2 .stat-number {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      box-shadow: 0 6px 16px rgba(34, 197, 94, 0.3);
    }
    .level-3 .stat-number {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      box-shadow: 0 6px 16px rgba(245, 158, 11, 0.3);
    }
    .level-4 .stat-number {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
    }
    .level-5 .stat-number {
      background: linear-gradient(135deg, #991b1b, #7f1d1d);
      box-shadow: 0 6px 16px rgba(153, 27, 27, 0.3);
    }
  }
}
</style>
