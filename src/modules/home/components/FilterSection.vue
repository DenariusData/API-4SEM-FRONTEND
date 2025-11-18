<template>
  <div class="filters-section">
    <div class="filters">
      <div class="filter-item">
        <label>Filtrar por tipo:</label>
        <select :value="selectedCriterion" @change="onCriterionChange">
          <option value="">Todos os tipos</option>
          <option v-for="criterion in criteria" :key="criterion.id" :value="criterion.id">
            {{ criterion.name }}
          </option>
        </select>
      </div>

      <div class="filter-item">
        <label>Filtrar por nível:</label>
        <select :value="selectedLevel" @change="onLevelChange">
          <option value="">Todos os níveis</option>
          <option v-for="level in [1, 2, 3, 4, 5]" :key="level" :value="level">Nível {{ level }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Criterion } from '@/modules/home/types/homeTypes'

interface Props {
  criteria: Criterion[]
  selectedCriterion: string
  selectedLevel: string
}

interface Emits {
  (event: 'update:selectedCriterion', value: string): void
  (event: 'update:selectedLevel', value: string): void
  (event: 'criterionChanged'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function onCriterionChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:selectedCriterion', target.value)
  emit('criterionChanged')
}

function onLevelChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:selectedLevel', target.value)
}
</script>

<style lang="scss" scoped>
.filters-section {
  .filters {
    display: flex;
    gap: 24px;
    align-items: center;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
  }

  .filter-item {
    display: flex;
    align-items: center;
    gap: 8px;

    label {
      font-size: 14px;
      font-weight: 500;
      color: #374151;
    }

    select {
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      background: white;
      min-width: 180px;

      &:focus {
        outline: none;
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
      }
    }
  }
}
</style>
