<template>
  <div class="alert-details">
    <div class="alert-details__header">
      <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" class="alert-details__back-btn" />
      <h1 class="alert-details__title">Detalhes do Alerta #{{ id }}</h1>
    </div>

    <div class="alert-details__content">
      <v-card class="alert-details__card">
        <v-card-title class="alert-details__card-title"> Informações do Alerta </v-card-title>
        <v-card-text>
          <p>Exibindo detalhes para o alerta com ID: {{ id }}</p>
          <p class="text-caption">
            Esta é uma página de exemplo. Aqui serão exibidos os detalhes completos do alerta selecionado.
          </p>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
  id: string
}

defineProps<Props>()
const router = useRouter()

const goBack = () => {
  router.go(-1)
}
</script>

<style lang="scss" scoped>
.alert-details {
  padding: 24px;

  &__header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
  }

  &__back-btn {
    flex-shrink: 0;
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  &__content {
    max-width: 800px;
  }

  &__card {
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  &__card-title {
    background: #f8f9fa;
    border-bottom: 1px solid #e0e0e0;
    font-weight: 600;
  }
}
</style>
