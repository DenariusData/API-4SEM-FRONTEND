<template>
  <div class="alert-details">
    <div class="alert-details__header">
      <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" class="alert-details__back-btn" />
      <h1 class="alert-details__title">Detalhes do Alerta #{{ id }}</h1>
    </div>

    <div v-if="isLoading" class="alert-details__loading">
      <v-progress-circular indeterminate size="48" color="primary"></v-progress-circular>
      <p>Carregando detalhes do alerta...</p>
    </div>

    <div v-else-if="error" class="alert-details__error">
      <v-icon color="error" size="48">mdi-alert-circle</v-icon>
      <p>{{ error }}</p>
      <v-btn color="primary" @click="fetchAlertDetails">Tentar novamente</v-btn>
    </div>

    <div v-else-if="alertDetails" class="alert-details__content">
      <v-card class="alert-details__info-card">
        <v-card-title class="alert-details__card-title">
          <v-icon class="mr-2">mdi-information</v-icon>
          Informações do Alerta
        </v-card-title>

        <v-card-text class="alert-details__info-content">
          <div class="alert-details__info-row">
            <div class="alert-details__info-item">
              <span class="alert-details__label">Indicador:</span>
              <span class="alert-details__value alert-details__value--bold">{{ alertDetails.indicator }}</span>
            </div>
            <div class="alert-details__info-item">
              <span class="alert-details__label">Status:</span>
              <v-chip
                :color="alertDetails.finalized ? 'success' : 'warning'"
                size="small"
                class="alert-details__status-chip"
              >
                <v-icon start size="16">
                  {{ alertDetails.finalized ? 'mdi-check-circle' : 'mdi-clock-alert' }}
                </v-icon>
                {{ alertDetails.finalized ? 'Finalizado' : 'Em andamento' }}
              </v-chip>
            </div>
          </div>

          <div class="alert-details__info-row">
            <div class="alert-details__info-item alert-details__info-item--full">
              <span class="alert-details__label">Mudança de Nível:</span>
              <div class="alert-details__level-change">
                <v-chip
                  :color="getLevelColor(alertDetails.previousLevel)"
                  variant="tonal"
                  class="alert-details__level-chip"
                >
                  {{ getLevelLabel(alertDetails.previousLevel) }}
                </v-chip>
                <v-icon>mdi-arrow-right</v-icon>
                <v-chip
                  :color="getLevelColor(alertDetails.currentLevel)"
                  variant="tonal"
                  class="alert-details__level-chip"
                >
                  {{ getLevelLabel(alertDetails.currentLevel) }}
                </v-chip>
              </div>
            </div>
          </div>

          <div class="alert-details__info-row">
            <div class="alert-details__info-item">
              <span class="alert-details__label">
                <v-icon size="18" class="mr-1">mdi-map-marker</v-icon>
                Local:
              </span>
              <span class="alert-details__value">{{ alertDetails.location }}</span>
            </div>
            <div class="alert-details__info-item">
              <span class="alert-details__label">
                <v-icon size="18" class="mr-1">mdi-clock</v-icon>
                Horário:
              </span>
              <span class="alert-details__value">{{ formatTimestamp(alertDetails.timestamp) }}</span>
            </div>
          </div>

          <div class="alert-details__info-row">
            <div class="alert-details__info-item">
              <span class="alert-details__label">Tempo decorrido:</span>
              <span class="alert-details__value alert-details__value--accent">{{ timeElapsed }}</span>
            </div>
          </div>

          <div v-if="userRole === 'manager'" class="alert-details__manager-info">
            <div class="alert-details__info-row">
              <div class="alert-details__info-item">
                <span class="alert-details__label">Zona:</span>
                <span class="alert-details__value">{{ alertDetails.zone }}</span>
              </div>
              <div class="alert-details__info-item">
                <span class="alert-details__label">Radar:</span>
                <span class="alert-details__value">{{ alertDetails.radar_id }}</span>
              </div>
            </div>

            <div v-if="alertDetails.affected_radars && alertDetails.affected_radars.length > 0" class="alert-details__affected-radars">
              <span class="alert-details__label">Radares Afetados:</span>
              <div class="alert-details__radar-chips">
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

          <div v-if="alertDetails.description" class="alert-details__description">
            <span class="alert-details__label">Descrição:</span>
            <p class="alert-details__description-text">{{ alertDetails.description }}</p>
          </div>
        </v-card-text>
      </v-card>

      <div v-if="userRole === 'agent' && !alertDetails.finalized" class="alert-details__agent-section">
        <v-card class="alert-details__card mb-4">
          <v-card-title class="alert-details__card-title">
            <v-icon class="mr-2">mdi-clipboard-text</v-icon>
            Orientações Iniciais
          </v-card-title>
          <v-card-text>
            <v-alert type="info" variant="tonal" class="mb-0">
              <div class="alert-details__orientation">
                <v-icon size="24" class="mr-3">mdi-map-marker-radius</v-icon>
                <div>
                  <strong>Recomendação:</strong> Dirija-se ao radar <strong>{{ alertDetails.radar_id }}</strong>
                  localizado em <strong>{{ alertDetails.location }}</strong> e identifique o problema no local.
                </div>
              </div>
            </v-alert>
          </v-card-text>
        </v-card>

        <v-card class="alert-details__card mb-4">
          <v-card-title class="alert-details__card-title">
            <v-icon class="mr-2">mdi-alert-box</v-icon>
            Identificação do Problema
          </v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedProblem"
              :items="problems"
              item-title="name"
              item-value="id"
              label="Selecione o problema identificado"
              variant="outlined"
              :hint="selectedProblemDescription"
              persistent-hint
              @update:model-value="onProblemSelected"
            >
              <template #prepend-inner>
                <v-icon>mdi-magnify</v-icon>
              </template>
            </v-select>

            <div v-if="problems.length === 0" class="alert-details__no-problems">
              <v-icon color="warning" size="32">mdi-alert</v-icon>
              <p class="mt-2">Nenhum problema cadastrado encontrado.</p>
              <v-btn color="success" variant="tonal" class="mt-3" @click="contactManager">
                <v-icon start>mdi-whatsapp</v-icon>
                Contatar Gestor pelo WhatsApp
              </v-btn>
              <p class="text-caption mt-2">
                Entre em contato com o gestor para solicitar a criação do problema e protocolo adequados.
              </p>
            </div>
          </v-card-text>
        </v-card>

        <v-card v-if="selectedProblem" class="alert-details__card mb-4">
          <v-card-title class="alert-details__card-title">
            <v-icon class="mr-2">mdi-format-list-checkbox</v-icon>
            Protocolo de Resolução
          </v-card-title>
          <v-card-text>
            <div v-if="isLoadingProtocol" class="alert-details__protocol-loading">
              <v-progress-circular indeterminate size="32" color="primary"></v-progress-circular>
              <p>Carregando protocolo...</p>
            </div>

            <div v-else-if="protocol" class="alert-details__protocol">
              <h3 class="alert-details__protocol-title">{{ protocol.title }}</h3>
              <v-list class="alert-details__protocol-steps">
                <v-list-item
                  v-for="(step, index) in protocol.steps"
                  :key="index"
                  class="alert-details__protocol-step"
                >
                  <template #prepend>
                    <v-avatar color="primary" size="32" class="mr-3">
                      <span class="text-white">{{ index + 1 }}</span>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ step }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </div>

            <v-alert v-else type="warning" variant="tonal">
              <div class="alert-details__no-protocol">
                <v-icon size="24" class="mr-3">mdi-alert-circle</v-icon>
                <div>
                  <strong>Protocolo não encontrado</strong>
                  <p class="mt-1">O protocolo para este problema ainda não foi criado.</p>
                  <v-btn color="success" variant="text" class="mt-2 pa-0" @click="contactManager">
                    <v-icon start>mdi-whatsapp</v-icon>
                    Contatar Gestor
                  </v-btn>
                </div>
              </div>
            </v-alert>
          </v-card-text>
        </v-card>

        <v-card v-if="protocol" class="alert-details__card mb-4">
          <v-card-title class="alert-details__card-title">
            <v-icon class="mr-2">mdi-note-text</v-icon>
            Anotações da Resolução
          </v-card-title>
          <v-card-text>
            <v-textarea
              v-model="resolutionNotes"
              label="Descreva como o problema foi resolvido"
              variant="outlined"
              rows="4"
              placeholder="Ex: Acidente removido, via liberada às 14:30. Sem feridos."
            ></v-textarea>
          </v-card-text>
        </v-card>

        <div class="alert-details__actions">
          <v-btn
            color="success"
            size="large"
            :disabled="!canFinalize"
            @click="finalizeAlert"
            block
          >
            <v-icon start>mdi-check-circle</v-icon>
            Finalizar Alerta
          </v-btn>
          <p v-if="!canFinalize" class="text-caption text-center mt-2 text-grey">
            Complete todos os passos acima para finalizar o alerta
          </p>
        </div>
      </div>

      <div v-if="userRole === 'manager' && !alertDetails.finalized" class="alert-details__manager-section">
        <v-card class="alert-details__card">
          <v-card-title class="alert-details__card-title">
            <v-icon class="mr-2">mdi-account-tie</v-icon>
            Acionar Agente
          </v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedAgent"
              :items="availableAgents"
              item-title="name"
              item-value="id"
              label="Selecione o agente para resolver este alerta"
              variant="outlined"
            >
              <template #prepend-inner>
                <v-icon>mdi-account-search</v-icon>
              </template>
              <template #item="{ props: itemProps }">
                <v-list-item v-bind="itemProps">
                  <template #prepend>
                    <v-avatar color="primary" size="32">
                      <v-icon>mdi-account</v-icon>
                    </v-avatar>
                  </template>
                  <template #append>
                    <v-chip size="x-small" color="success" variant="tonal">
                      Disponível
                    </v-chip>
                  </template>
                </v-list-item>
              </template>
            </v-select>

            <div v-if="availableAgents.length === 0" class="alert-details__no-agents">
              <v-icon color="warning" size="32">mdi-alert</v-icon>
              <p class="mt-2">Nenhum agente disponível no momento.</p>
            </div>
          </v-card-text>
        </v-card>

        <div class="alert-details__actions mt-4">
          <v-btn
            color="success"
            size="large"
            :disabled="!canFinalize"
            @click="contactAgent"
            block
          >
            <v-icon start>mdi-whatsapp</v-icon>
            Contatar Agente pelo WhatsApp
          </v-btn>
        </div>
      </div>

      <v-alert v-if="alertDetails.finalized" type="success" variant="tonal" class="mt-4">
        <v-icon start size="24">mdi-check-circle</v-icon>
        <strong>Este alerta já foi finalizado</strong>
      </v-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import alertServices from '@/modules/alerts/services/alertServices'
import type { AlertDetails, Problem, Protocol, Agent } from '@/modules/alerts/types/alertsTypes'
import { LEVELS_ENUM } from '@/shared/enums'

interface Props {
  id: string
}

const props = defineProps<Props>()
const router = useRouter()

const alertDetails = ref<AlertDetails | null>(null)
const problems = ref<Problem[]>([])
const agents = ref<Agent[]>([])
const selectedProblem = ref<number | null>(null)
const protocol = ref<Protocol | null>(null)
const selectedAgent = ref<number | null>(null)
const resolutionNotes = ref('')

const isLoading = ref(true)
const isLoadingProtocol = ref(false)
const error = ref<string | null>(null)

let updateInterval: number | null = null

const userRole = ref<'agent' | 'manager'>('agent')

const levelColors: Record<number, string> = {
  1: 'success',
  2: 'success',
  3: 'warning',
  4: 'error',
  5: 'error',
}

const getLevelLabel = (level: number): string => {
  return LEVELS_ENUM[level as keyof typeof LEVELS_ENUM] || 'Desconhecido'
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
  if (!alertDetails.value) return ''

  const now = new Date()
  const alertTime = new Date(alertDetails.value.timestamp)
  const diffMs = now.getTime() - alertTime.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Agora mesmo'
  if (diffMins < 60) return `${diffMins} minutos atrás`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} horas atrás`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} dias atrás`
})

const selectedProblemDescription = computed(() => {
  if (!selectedProblem.value) return ''
  const problem = problems.value.find(p => p.id === selectedProblem.value)
  return problem?.description || ''
})

const availableAgents = computed(() => {
  return agents.value.filter(agent => agent.available)
})

const canFinalize = computed(() => {
  if (userRole.value === 'agent') {
    return selectedProblem.value !== null && protocol.value !== null && resolutionNotes.value.trim() !== ''
  }
  return selectedAgent.value !== null
})

const managerContactPhone = '5512999999999'

const fetchAlertDetails = async () => {
  try {
    isLoading.value = true
    error.value = null

    const alertId = Number(props.id)
    const response = await alertServices.getDetails(alertId)
    alertDetails.value = response.data
  } catch (err) {
    error.value = 'Erro ao carregar detalhes do alerta'
    console.error('Erro ao buscar detalhes do alerta:', err)
  } finally {
    isLoading.value = false
  }
}

const fetchProblems = async () => {
  try {
    const response = await alertServices.getProblems()
    problems.value = response.data.items
  } catch (err) {
    console.error('Erro ao buscar problemas:', err)
  }
}

const fetchAgents = async () => {
  try {
    const response = await alertServices.getAgents()
    agents.value = response.data.items
  } catch (err) {
    console.error('Erro ao buscar agentes:', err)
  }
}

const onProblemSelected = async (problemId: number) => {
  if (!problemId) {
    protocol.value = null
    return
  }

  selectedProblem.value = problemId
  protocol.value = null

  try {
    isLoadingProtocol.value = true
    const response = await alertServices.getProtocol(problemId)
    protocol.value = response.data
  } catch (err) {
    console.error('Erro ao buscar protocolo:', err)
    protocol.value = null
  } finally {
    isLoadingProtocol.value = false
  }
}

const contactManager = () => {
  const message = encodeURIComponent(
    `Olá! Não encontrei o problema adequado para o alerta #${alertDetails.value?.alert_id}. ` +
    `Indicador: ${alertDetails.value?.indicator}. ` +
    `Local: ${alertDetails.value?.location}. ` +
    `Preciso que crie o problema e protocolo necessário.`
  )
  window.open(`https://wa.me/${managerContactPhone}?text=${message}`, '_blank')
}

const contactAgent = () => {
  const agent = agents.value.find(a => a.id === selectedAgent.value)
  if (!agent) return

  const message = encodeURIComponent(
    `Olá ${agent.name}! Você foi acionado para resolver o alerta #${alertDetails.value?.alert_id}. ` +
    `Indicador: ${alertDetails.value?.indicator}. ` +
    `Local: ${alertDetails.value?.location}. ` +
    `Zona: ${alertDetails.value?.zone}. ` +
    `Por favor, dirija-se ao local para avaliação.`
  )
  window.open(`https://wa.me/${agent.phone}?text=${message}`, '_blank')
}

const finalizeAlert = async () => {
  if (!canFinalize.value || !alertDetails.value) return

  try {
    const data = userRole.value === 'agent' ? {
      problem_id: selectedProblem.value ?? undefined,
      notes: resolutionNotes.value,
    } : {
      agent_id: selectedAgent.value ?? undefined,
    }

    await alertServices.finalizeAlert(alertDetails.value.alert_id, data)

    alert('Alerta finalizado com sucesso!')
    router.push({ name: 'alerts' })
  } catch (err) {
    error.value = 'Erro ao finalizar alerta'
    console.error('Erro ao finalizar alerta:', err)
  }
}

const goBack = () => {
  router.go(-1)
}

onMounted(async () => {
  await fetchAlertDetails()

  if (userRole.value === 'agent') {
    await fetchProblems()
  } else {
    await fetchAgents()
  }

  updateInterval = window.setInterval(() => {
    fetchAlertDetails()
  }, 60000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style lang="scss" scoped>
.alert-details {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;

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
    font-size: 1.75rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  &__loading,
  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 64px 24px;
    text-align: center;
    color: #6b7280;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

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

  &__info-content {
    padding: 24px;
  }

  &__info-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__info-item {
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

  &__orientation {
    display: flex;
    align-items: flex-start;
  }

  &__no-problems,
  &__no-agents {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 16px;
    text-align: center;
    color: #6b7280;
  }

  &__protocol-loading {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px;
    justify-content: center;
  }

  &__protocol-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 16px;
  }

  &__protocol-steps {
    background: transparent;
    padding: 0;
  }

  &__protocol-step {
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;

    &:last-child {
      border-bottom: none;
    }
  }

  &__no-protocol {
    display: flex;
    align-items: flex-start;
  }

  &__actions {
    margin-top: 24px;
  }

  &__agent-section,
  &__manager-section {
    margin-top: 24px;
  }
}
</style>
