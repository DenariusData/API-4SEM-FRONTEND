<script setup lang="ts">
import LevelsDisplay from '@/modules/indicators/components/LevelsDisplay.vue'
import IndicatorsList from '@/modules/indicators/components/IndicatorsList.vue'
</script>

<template>
  <div class="indicators-view">
    <div class="page-header">
      <h1>Indicadores de Mobilidade</h1>
      <p>Visualize e compreenda os critérios e níveis de mobilidade urbana</p>
    </div>

    <LevelsDisplay />

    <IndicatorsList />
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

@media (max-width: 768px) {
  .indicators-view {
    padding: 16px;
    gap: 24px;
  }

  .page-header h1 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .indicators-view {
    gap: 20px;
  }
}
</style>
