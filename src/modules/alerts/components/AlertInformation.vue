<template>
  <v-card class="alert-info__card">
    <v-card-title class="alert-info__card-title">
      <v-icon class="mr-2">mdi-information</v-icon>
      Alert Information
    </v-card-title>

    <v-card-text class="alert-info__content">
      <div class="alert-info__row">
        <div class="alert-info__item">
          <span class="alert-info__label">Indicator:</span>
          <span class="alert-info__value alert-info__value--bold">{{ alertDetails.indicator }}</span>
        </div>
        <div class="alert-info__item">
          <span class="alert-info__label">Status:</span>
          <v-chip :color="alertDetails.finalized ? 'success' : 'warning'" size="small" class="alert-info__status-chip">
            <v-icon start size="16">
              {{ alertDetails.finalized ? 'mdi-check-circle' : 'mdi-clock-alert' }}
            </v-icon>
            {{ alertDetails.finalized ? 'Finalized' : 'In Progress' }}
          </v-chip>
        </div>
      </div>

      <div class="alert-info__row">
        <div class="alert-info__item alert-info__item--full">
          <span class="alert-info__label">Level Change:</span>
          <div class="alert-info__level-change">
            <v-chip :color="getLevelColor(alertDetails.previousLevel)" variant="tonal" class="alert-info__level-chip">
              {{ getLevelLabel(alertDetails.previousLevel) }}
            </v-chip>
            <v-icon>mdi-arrow-right</v-icon>
            <v-chip :color="getLevelColor(alertDetails.currentLevel)" variant="tonal" class="alert-info__level-chip">
              {{ getLevelLabel(alertDetails.currentLevel) }}
            </v-chip>
          </div>
        </div>
      </div>

      <div class="alert-info__row">
        <div class="alert-info__item">
          <span class="alert-info__label">
            <v-icon size="18" class="mr-1">mdi-map-marker</v-icon>
            Location:
          </span>
          <span class="alert-info__value">{{ alertDetails.location }}</span>
        </div>
        <div class="alert-info__item">
          <span class="alert-info__label">
            <v-icon size="18" class="mr-1">mdi-clock</v-icon>
            Time:
          </span>
          <span class="alert-info__value">{{ formatTimestamp(alertDetails.timestamp) }}</span>
        </div>
      </div>

      <div class="alert-info__row">
        <div class="alert-info__item">
          <span class="alert-info__label">Time Elapsed:</span>
          <span class="alert-info__value alert-info__value--accent">{{ timeElapsed }}</span>
        </div>
      </div>

      <div v-if="userRole === 'manager'" class="alert-info__manager-info">
        <div class="alert-info__row">
          <div class="alert-info__item">
            <span class="alert-info__label">Zone:</span>
            <span class="alert-info__value">{{ alertDetails.zone }}</span>
          </div>
          <div class="alert-info__item">
            <span class="alert-info__label">Radar:</span>
            <span class="alert-info__value">{{ alertDetails.radar_id }}</span>
          </div>
        </div>

        <div v-if="alertDetails.affected_radars?.length > 0" class="alert-info__affected-radars">
          <span class="alert-info__label">Affected Radars:</span>
          <div class="alert-info__radar-chips">
            <v-chip
              v-for="radar in alertDetails.affected_radars"
              :key="radar"
              size="small"
              color="error"
              variant="tonal"
              class="mr-2 mb-2"
            >
              <v-icon start size="16">mdi-radar</v-icon>
              {{ radar }}
            </v-chip>
          </div>
        </div>
      </div>

      <div v-if="alertDetails.description" class="alert-info__description">
        <span class="alert-info__label">Description:</span>
        <p class="alert-info__description-text">{{ alertDetails.description }}</p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AlertDetails } from '@/modules/alerts/types/alertsTypes'
import { LEVELS_ENUM } from '@/shared/enums'

interface Props {
  alertDetails: AlertDetails
  userRole: 'agent' | 'manager'
}

const props = defineProps<Props>()

const levelColors: Record<number, string> = {
  1: 'success',
  2: 'success',
  3: 'warning',
  4: 'error',
  5: 'error',
}

const getLevelLabel = (level: number): string => {
  return LEVELS_ENUM[level as keyof typeof LEVELS_ENUM] || 'Unknown'
}

const getLevelColor = (level: number): string => {
  return levelColors[level] || 'grey'
}

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const timeElapsed = computed(() => {
  if (!props.alertDetails) return ''

  const now = new Date()
  const alertTime = new Date(props.alertDetails.timestamp)
  const diffMs = now.getTime() - alertTime.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minutes ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hours ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} days ago`
})
</script>

<style lang="scss" scoped>
.alert-info {
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

  &__content {
    padding: 24px;
  }

  &__row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &--full {
      grid-column: 1 / -1;
    }
  }

  &__label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
    display: flex;
    align-items: center;
  }

  &__value {
    font-size: 1rem;
    color: #1f2937;

    &--bold {
      font-weight: 600;
      font-size: 1.1rem;
    }

    &--accent {
      color: #2563eb;
      font-weight: 500;
    }
  }

  &__level-change {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__level-chip {
    font-weight: 500;
  }

  &__status-chip {
    font-weight: 500;
  }

  &__manager-info {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 2px solid #e5e7eb;
  }

  &__affected-radars {
    margin-top: 16px;
  }

  &__radar-chips {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
  }

  &__description {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 2px solid #e5e7eb;
  }

  &__description-text {
    margin-top: 8px;
    color: #4b5563;
    line-height: 1.6;
  }
}
</style>
