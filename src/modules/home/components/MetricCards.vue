<template>
  <div class="metric-cards-container" :class="position">
    <div v-for="metric in metrics" :key="metric.id" class="metric-card" :class="`nivel-${metric.nivel}`">
      <div class="metric-title">{{ metric.name }}</div>
      <div class="metric-level">Nível {{ metric.nivel }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ZoneMetric } from '@/modules/home/types/homeTypes'

interface Props {
  metrics: ZoneMetric[]
  position: 'left' | 'right'
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.metric-cards-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 200px;

  .metric-card {
    padding: 12px 16px;
    border-radius: 8px;
    color: white;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;

    &:hover {
      transform: translateY(-2px);
    }

    &.nivel-1 {
      background: #10b981;
    }

    &.nivel-2 {
      background: #7af957;
      color: #333;
    }

    &.nivel-3 {
      background: #edef56;
      color: #333;
    }

    &.nivel-4 {
      background: #f59e0b;
    }

    &.nivel-5 {
      background: #ef4444;
    }

    .metric-title {
      font-size: 12px;
      margin-bottom: 4px;
      opacity: 0.9;
      font-weight: 500;
    }

    .metric-level {
      font-size: 16px;
      font-weight: 700;
    }
  }
}
</style>
