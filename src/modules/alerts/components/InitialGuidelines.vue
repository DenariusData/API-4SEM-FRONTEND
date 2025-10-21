<template>
  <v-card class="initial-guidelines__card">
    <v-card-title class="initial-guidelines__card-title">
      <v-icon class="mr-2">mdi-clipboard-text</v-icon>
      Orientações Iniciais
    </v-card-title>
    <v-card-text>
      <v-alert type="info" variant="tonal" class="mb-0">
        <div class="initial-guidelines__orientation">
          <v-icon size="24" class="mr-3">mdi-map-marker-radius</v-icon>
          <div>
            <strong>Recomendação:</strong> Dirija-se ao radar <strong>{{ radarId }}</strong> localizado em
            <strong>{{ location }}</strong> e identifique o problema no local.
          </div>
        </div>
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  radarId: string | undefined
  location: string
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.initial-guidelines {
  &__card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
    border: 1px solid #e5e7eb;
  }

  &__card-title {
    background: #f8f9fa;
    border-bottom: 1px solid #e5e7eb;
    font-weight: 600;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    padding: 16px 20px;
  }

  &__orientation {
    display: flex;
    align-items: flex-start;
  }
}
</style>
