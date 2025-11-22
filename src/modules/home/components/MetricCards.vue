<template>
  <div class="metric-cards-container">
    <div v-for="metric in metrics" :key="metric.id" class="metric-card" :class="`nivel-${metric.nivel}`">
      <div class="metric-region">{{ metric.region }}</div>
      <div class="metric-title">{{ metric.name }}</div>
      <div class="metric-level">Nível {{ metric.nivel }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ZoneMetric } from '@/modules/home/types/homeTypes'

interface Props {
  metrics: ZoneMetric[]
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.metric-cards-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 8px;
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

    .metric-region {
      font-size: 10px;
      font-weight: 600;
      margin-bottom: 2px;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
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
