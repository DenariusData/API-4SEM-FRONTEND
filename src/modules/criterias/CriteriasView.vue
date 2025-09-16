<template>
  <div class="criterias-view">
    <div class="criterias-view__header">
      <h1>Lista de Critérios</h1>
      <v-btn prepend-icon="mdi-plus" @click="createCriteria">Criar critério</v-btn>
    </div>
    <v-expansion-panels class="criterias-view__panels" multiple variant="accordion">
      <v-expansion-panel v-for="criteria in criterias" :key="criteria.id">
        <v-expansion-panel-title>
          {{ criteria.name }}
          <template v-slot:actions="{ expanded }">
            <div class="criterias-view__actions">
              <v-btn prepend-icon="mdi-pencil" @click.stop="editCriteria">Editar</v-btn>
              <v-btn prepend-icon="mdi-trash-can" @click.stop="deleteCriteria">Deletar</v-btn>
              <v-icon :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"></v-icon>
            </div>
          </template>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          {{ criteria.description }}
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
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

const createCriteria = () => {
  console.log('Criar critério')
}
const deleteCriteria = () => {
  console.log('Deletar critério')
}
const editCriteria = () => {
  console.log('Editar critério')
}
</script>

<style lang="scss" scoped>
.criterias-view {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .criterias-view__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
  }
  .criterias-view__panels {
    display: flex;
    flex-direction: column;

    .criterias-view__actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}
</style>
