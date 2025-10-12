<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import alertServices from '@/modules/alerts/services/alertServices'
import type { Alert } from '@/modules/alerts/types/alertsTypes'
import { LEVELS_ENUM } from '@/shared/enums'
import { useRouter } from 'vue-router'

const router = useRouter()

const isOpen = ref(false)
const alerts = ref<Alert[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const alertsCount = computed(() => alerts.value.length)

const levelColors = {
  1: 'success',
  2: 'success',
  3: 'warning',
  4: 'error',
  5: 'error',
}

const fetchAlerts = async () => {
  try {
    isLoading.value = true
    error.value = null
    const response = await alertServices.getLastTen()
    alerts.value = response.data.items
  } catch (err) {
    error.value = 'Erro ao carregar alertas'
    console.error('Erro ao buscar alertas:', err)
  } finally {
    isLoading.value = false
  }
}

const getLevelLabel = (level: number): string => {
  return LEVELS_ENUM[level as keyof typeof LEVELS_ENUM] || 'Desconhecido'
}

const getLevelColor = (level: number): string => {
  return levelColors[level as keyof typeof levelColors] || 'grey'
}

const formatTime = (timestamp: string): string => {
  const now = new Date()
  const alertTime = new Date(timestamp)
  const diffMs = now.getTime() - alertTime.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Agora'
  if (diffMins < 60) return `${diffMins}min`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d`
}

const clearNotifications = () => {
  alerts.value = []
  isOpen.value = false
}

const goToAlertsPage = () => {
  isOpen.value = false
  router.push({ name: 'alerts' })
}

onMounted(() => {
  fetchAlerts()
})

defineExpose({
  fetchAlerts,
  alertsCount,
})
</script>

<template>
  <v-menu v-model="isOpen" :close-on-content-click="false" location="bottom end" offset="8">
    <template v-slot:activator="{ props }">
      <v-btn icon variant="text" color="black" v-bind="props" class="notification-dropdown__trigger">
        <v-badge v-if="alertsCount > 0" :content="alertsCount" color="error" class="notification-dropdown__badge">
          <v-icon>mdi-bell</v-icon>
        </v-badge>
        <v-icon v-else>mdi-bell</v-icon>
      </v-btn>
    </template>

    <v-card class="notification-dropdown__card" min-width="400" max-width="500">
      <v-card-title class="notification-dropdown__header">
        <span>Notificações</span>
        <v-chip v-if="alertsCount > 0" size="small" color="error" variant="tonal">
          {{ alertsCount }}
        </v-chip>
      </v-card-title>

      <v-card-text class="notification-dropdown__content">
        <div v-if="isLoading" class="notification-dropdown__loading">
          <v-progress-circular indeterminate size="24"></v-progress-circular>
          <span>Carregando alertas...</span>
        </div>

        <div v-else-if="error" class="notification-dropdown__error">
          <v-icon color="error">mdi-alert-circle</v-icon>
          <span>{{ error }}</span>
        </div>

        <div v-else-if="alerts.length === 0" class="notification-dropdown__empty">
          <v-icon color="grey">mdi-bell-sleep</v-icon>
          <span>Nenhuma notificação</span>
        </div>

        <div v-else class="notification-dropdown__list">
          <div v-for="alert in alerts" :key="alert.id" class="notification-dropdown__item">
            <div class="notification-dropdown__item-header">
              <span class="notification-dropdown__indicator">{{ alert.indicator }}</span>
              <span class="notification-dropdown__time">{{ formatTime(alert.timestamp) }}</span>
            </div>

            <div class="notification-dropdown__levels">
              <div class="notification-dropdown__level-change">
                <v-chip
                  size="small"
                  :color="getLevelColor(alert.previousLevel)"
                  variant="tonal"
                  class="notification-dropdown__level-chip"
                >
                  {{ getLevelLabel(alert.previousLevel) }}
                </v-chip>
                <v-icon size="16" class="notification-dropdown__arrow">mdi-arrow-right</v-icon>
                <v-chip
                  size="small"
                  :color="getLevelColor(alert.newLevel)"
                  variant="tonal"
                  class="notification-dropdown__level-chip"
                >
                  {{ getLevelLabel(alert.newLevel) }}
                </v-chip>
              </div>
            </div>

            <div class="notification-dropdown__location">
              <v-icon size="16" color="grey">mdi-map-marker</v-icon>
              <span>{{ alert.location }}</span>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions v-if="alerts.length > 0" class="notification-dropdown__actions">
        <v-btn variant="text" size="small" @click="clearNotifications" class="notification-dropdown__clear-btn">
          Limpar todas
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn variant="text" size="small" color="primary" @click="goToAlertsPage"> Ver todas </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<style lang="scss" scoped>
.notification-dropdown {
  &__trigger {
    position: relative;
  }

  &__badge {
    :deep(.v-badge__badge) {
      font-size: 11px;
      min-width: 18px;
      height: 18px;
    }
  }

  &__card {
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
    border: 1px solid #e0e0e0;
  }

  &__header {
    background: #f8f9fa;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    font-weight: 600;
    font-size: 1.1rem;
  }

  &__content {
    padding: 0;
    max-height: 400px;
    overflow-y: auto;
  }

  &__loading,
  &__error,
  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 32px;
    color: #6b7280;
    font-size: 0.95rem;
  }

  &__list {
    padding: 8px 0;
  }

  &__item {
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f8f9fa;
    }

    &:last-child {
      border-bottom: none;
    }
  }

  &__item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  &__indicator {
    font-weight: 600;
    color: #1f2937;
    font-size: 0.95rem;
  }

  &__time {
    font-size: 0.8rem;
    color: #6b7280;
  }

  &__levels {
    margin-bottom: 8px;
  }

  &__level-change {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__level-chip {
    font-size: 0.75rem !important;
    height: 24px !important;
  }

  &__arrow {
    color: #6b7280;
  }

  &__location {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    color: #6b7280;
  }

  &__actions {
    border-top: 1px solid #e0e0e0;
    background: #f8f9fa;
    padding: 12px 16px;
  }

  &__clear-btn {
    color: #6b7280;
  }
}
</style>
