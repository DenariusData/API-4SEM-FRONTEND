<template>
  <div>
    <h1>Lista de Critérios</h1>
    <ul>
      <li v-for="criteria in criterias" :key="criteria.id">{{ criteria.name }} - {{ criteria.description }}</li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import criteriasServices from '@/modules/criterias/services/criteriasServices.ts'
import { onMounted, ref } from 'vue'
import type { Criteria } from '@/modules/criterias/types/criteriasTypes'

const criterias = ref<Criteria[]>([])

onMounted(async () => {
  try {
    const response = await criteriasServices.get()
    criterias.value = response.data.items
  } catch (error) {
    console.error('Erro ao buscar critérios:', error)
  }
})
</script>
