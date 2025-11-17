<template>
  <div class="alerts-view">
    <h1>Alertas</h1>

    <div v-if="isLoading" class="loading">
      Carregando alertas...
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <v-list v-if="!isLoading && !error">
      <v-list-item
        v-for="alert in alerts"
        :key="alert.id"
        @click="openDetails(alert.alertId)"
        class="alert-item"
      >
        <div class="item-content">
          <div>
            <strong>#{{ alert.alertId }}</strong> — {{ alert.indicator }}
            <div class="subtitle">
              {{ alert.location }} • {{ alert.timestamp }}
            </div>
          </div>

          <v-chip
            size="small"
            :color="alert.finalized ? 'green' : 'orange'"
            variant="tonal"
          >
            {{ alert.finalized ? 'Finalizado' : 'Ativo' }}
          </v-chip>
        </div>
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import alertServices from '@/modules/alerts/services/alertServices'
import type { Alert } from '@/modules/alerts/types/alertsTypes'

const router = useRouter()

const alerts = ref<Alert[]>([])          // <--- tipagem explícita aqui
const isLoading = ref(true)
const error = ref<string | null>(null)

const loadAlerts = async () => {
  try {
    const response = await alertServices.getLastTen()
    alerts.value = response.data  // response.data é Alert[]
  } catch (err) {
    error.value = 'Erro ao carregar alertas'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const openDetails = (id: number) => {
  router.push(`/alerts/${id}`)
}

onMounted(() => {
  loadAlerts()
})
</script>


<style lang="scss" scoped>
.alerts-view {
  padding: 20px;
}

.loading,
.error {
  margin-top: 20px;
  text-align: center;
  font-size: 1.1rem;
}

.alert-item {
  cursor: pointer;
  padding: 14px 8px;
  border-bottom: 1px solid #eee;
}

.alert-item:hover {
  background: #fafafa;
}

.item-content {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.subtitle {
  color: #666;
  font-size: 0.85rem;
  margin-top: 4px;
}
</style>
