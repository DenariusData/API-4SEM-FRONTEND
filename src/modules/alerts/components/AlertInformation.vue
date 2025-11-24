<template>
  <v-card class="alert-info__card">
    <v-card-title class="alert-info__card-title">
      <v-icon class="mr-2">mdi-information</v-icon>
      Informações do Alerta
    </v-card-title>

    <v-card-text class="alert-info__content">
      <div class="alert-info__row">
        <div class="alert-info__item alert-info__item--full">
          <span class="alert-info__label">Mensagem:</span>
          <span class="alert-info__value alert-info__value--bold">
            {{ alertDetails.message }}
          </span>
        </div>
      </div>

      <div class="alert-info__row">
        <div class="alert-info__item">
          <span class="alert-info__label">Origem:</span>
          <v-chip size="small" color="info" variant="tonal" class="alert-info__compact-chip">
            <v-icon start size="16">mdi-source-branch</v-icon>
            {{ alertDetails.sourceType }}
          </v-chip>
        </div>

        <div class="alert-info__item">
          <span class="alert-info__label">Nível:</span>
          <v-chip
            :color="getLevelColor(alertDetails.level)"
            variant="tonal"
            size="small"
            :class="['alert-info__compact-chip', `level-bg-${alertDetails.level}`]"
          >
            {{ getLevelLabel(alertDetails.level) }}
          </v-chip>
        </div>
      </div>

      <div class="alert-info__row">
        <div class="alert-info__item">
          <span class="alert-info__label">Critério:</span>
          <span class="alert-info__value">{{ alertDetails.criterionName }}</span>
        </div>

        <div class="alert-info__item">
          <span class="alert-info__label">
            <v-icon size="18" class="mr-1">mdi-map-marker</v-icon>
            Região:
          </span>
          <span class="alert-info__value">{{ alertDetails.regionName }}</span>
        </div>
      </div>

      <div class="alert-info__row">
        <div class="alert-info__item">
          <span class="alert-info__label">
            <v-icon size="18" class="mr-1">mdi-clock-outline</v-icon>
            Criado em:
          </span>
          <span class="alert-info__value">
            {{ formatTimestamp(alertDetails.createdAt) }}
          </span>
        </div>

        <div class="alert-info__item">
          <span class="alert-info__label">Tempo Decorrido:</span>
          <span class="alert-info__value alert-info__value--accent">
            {{ timeElapsed }}
          </span>
        </div>
      </div>

      <div class="alert-info__row">
        <div class="alert-info__item">
          <span class="alert-info__label">Zona:</span>
          <span class="alert-info__value">{{ alertDetails.regionName }}</span>
        </div>

        <div class="alert-info__item">
          <span class="alert-info__label">Radar:</span>
          <span class="alert-info__value"></span>
        </div>
      </div>

      <div v-if="userRole === 'manager' && alertDetails.affected_radars?.length" class="alert-info__affected-radars">
        <span class="alert-info__label mb-2">Radares Afetados:</span>
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

      <div v-if="alertDetails.description" class="alert-info__description">
        <span class="alert-info__label">Descrição:</span>
        <p class="alert-info__description-text">{{ alertDetails.description }}</p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LEVELS_ENUM } from '@/shared/enums'

interface AlertDetails {
  message: string
  sourceType: string
  level: number
  criterionName: string
  regionName: string
  createdAt: string
  description?: string
  affected_radars?: string[]
}

interface Props {
  alertDetails: AlertDetails
  userRole: 'agent' | 'manager'
}

const props = defineProps<Props>()

const levelColors: Record<number, string> = {
  1: '#10b981',
  2: '#7af957',
  3: '#edef56',
  4: '#f59e0b',
  5: '#ef4444',
}

const getLevelLabel = (level: number): string => {
  return LEVELS_ENUM[level as keyof typeof LEVELS_ENUM] || 'Indefinido'
}

const getLevelColor = (level: number): string => {
  return levelColors[level] || 'grey'
}

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const timeElapsed = computed(() => {
  const now = new Date()
  const alertTime = new Date(props.alertDetails.createdAt)
  const diffMs = now.getTime() - alertTime.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Agora mesmo'
  if (diffMins < 60) return `${diffMins} min atrás`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h atrás`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d atrás`
})
</script>

<style lang="scss" scoped>
// ...existing code...
.level-bg-1 {
  background-color: #10b981 !important;
  color: #fff !important;
}
.level-bg-2 {
  background-color: #7af957 !important;
  color: #222 !important;
}
.level-bg-3 {
  background-color: #edef56 !important;
  color: #222 !important;
}
.level-bg-4 {
  background-color: #f59e0b !important;
  color: #fff !important;
}
.level-bg-5 {
  background-color: #ef4444 !important;
  color: #fff !important;
}
</style>

<style lang="scss" scoped>
.alert-info {
  &__card {
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
    border: 1px solid #e5e7eb;
  }

  &__card-title {
    background: linear-gradient(to right, #f8f9fa, #ffffff);
    border-bottom: 1px solid #e5e7eb;
    font-weight: 600;
    font-size: 1.05rem;
    display: flex;
    align-items: center;
    padding: 14px 20px;
  }

  &__content {
    padding: 20px;
  }

  &__row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 6px;

    &--full {
      grid-column: 1 / -1;
    }
  }

  &__label {
    font-size: 0.813rem;
    font-weight: 600;
    color: #6b7280;
    display: flex;
    align-items: center;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  &__value {
    font-size: 0.938rem;
    color: #1f2937;

    &--bold {
      font-weight: 600;
      font-size: 1.063rem;
      color: #111827;
    }

    &--accent {
      color: #2563eb;
      font-weight: 600;
    }
  }

  &__compact-chip {
    width: fit-content !important;
    padding: 0 8px !important;
    font-size: 0.875rem !important;
    font-weight: 500 !important;
  }

  &__affected-radars {
    margin-top: 20px;
    padding: 16px;
    background: #fef2f2;
    border-radius: 6px;
    border-left: 3px solid #ef4444;
  }

  &__radar-chips {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__description {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
  }

  &__description-text {
    margin-top: 8px;
    color: #4b5563;
    line-height: 1.6;
    font-size: 0.938rem;
  }
}

@media (max-width: 768px) {
  .alert-info {
    &__row {
      grid-template-columns: 1fr;
    }

    &__content {
      padding: 16px;
    }
  }
}
</style>
