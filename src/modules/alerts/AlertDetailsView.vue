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
      <div v-if="isLoadingAlertDetails" class="alert-details__loading">
        <v-progress-circular indeterminate size="48" color="primary"></v-progress-circular>
        <p>Carregando detalhes do alerta...</p>
      </div>
      <AlertInformation v-else :alert-details="alertDetails" :user-role="userRole" />

      <div v-if="userRole === 'agent' && !alertDetails.finalized" class="alert-details__agent-section">
        <InitialGuidelines :radar-id="alertDetails.radar_id" :location="alertDetails.location || ''" />

        <ProblemIdentification
          v-model="selectedProblem"
          :problems="problems"
          v-model:resolution-notes="resolutionNotes"
          @contact-manager="contactManager"
          class="mt-4"
        />

        <div class="alert-details__actions">
          <v-btn color="success" size="large" :disabled="!canFinalize" @click="finalizeAlert" block>
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
                    <v-chip size="x-small" color="success" variant="tonal"> Disponível </v-chip>
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
          <v-btn color="success" size="large" :disabled="!canFinalize" @click="contactAgent" block>
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
import problemsService from '@/modules/problems/services/problemsServices'
import usersService from '@/modules/users/services/userServices'
import type { AlertDetails } from '@/modules/alerts/types/alertsTypes'
import type { Problem } from '@/modules/alerts/types/alertsTypes'
import type { Agent } from '@/modules/alerts/types/alertsTypes'
import AlertInformation from './components/AlertInformation.vue'
import InitialGuidelines from './components/InitialGuidelines.vue'
import ProblemIdentification from './components/ProblemIdentification.vue'

interface Props {
  id: string
}

const props = defineProps<Props>()
const router = useRouter()

const alertDetails = ref<AlertDetails | null>(null)
const problems = ref<Problem[]>([])
const agents = ref<Agent[]>([])
const selectedProblem = ref<number | null>(null)
const selectedAgent = ref<number | null>(null)
const resolutionNotes = ref('')

const isLoading = ref(true)
const isLoadingAlertDetails = ref(false)
const error = ref<string | null>(null)

let updateInterval: number | null = null

const userRole = ref<'agent' | 'manager'>('agent')

const availableAgents = computed(() => {
  return agents.value.filter((agent) => agent.available)
})

const canFinalize = computed(() => {
  if (userRole.value === 'agent') {
    return selectedProblem.value !== null && resolutionNotes.value.trim() !== ''
  }
  return selectedAgent.value !== null
})

const managerContactPhone = '5512999999999'

const fetchAlertDetails = async () => {
  try {
    isLoadingAlertDetails.value = true
    error.value = null

    const alertId = Number(props.id)
    const response = await alertServices.getDetails(alertId)
    alertDetails.value = response.data
  } catch (err) {
    error.value = 'Erro ao carregar detalhes do alerta'
    console.error('Erro ao buscar detalhes do alerta:', err)
  } finally {
    isLoadingAlertDetails.value = false
  }
}

const fetchProblems = async () => {
  try {
    const response = await problemsService.getAll()
    problems.value = response.data
  } catch (err) {
    console.error('Erro ao buscar problemas:', err)
  }
}

const fetchAgents = async () => {
  try {
    const response = await usersService.getAgents()
    agents.value = response.data.items
  } catch (err) {
    console.error('Erro ao buscar agentes:', err)
  }
}

const contactManager = () => {
  const message = encodeURIComponent(
    `Olá! Não encontrei o problema adequado para o alerta #${alertDetails.value?.alert_id}. ` +
      `Indicador: ${alertDetails.value?.indicator}. ` +
      `Local: ${alertDetails.value?.location}. ` +
      `Preciso que crie o problema e protocolo necessário.`,
  )
  window.open(`https://wa.me/${managerContactPhone}?text=${message}`, '_blank')
}

const contactAgent = () => {
  const agent = agents.value.find((a) => a.id === selectedAgent.value)
  if (!agent) return

  const message = encodeURIComponent(
    `Olá ${agent.name}! Você foi acionado para resolver o alerta #${alertDetails.value?.alert_id}. ` +
      `Indicador: ${alertDetails.value?.indicator}. ` +
      `Local: ${alertDetails.value?.location}. ` +
      `Zona: ${alertDetails.value?.zone}. ` +
      `Por favor, dirija-se ao local para avaliação.`,
  )
  window.open(`https://wa.me/${agent.phone}?text=${message}`, '_blank')
}

const finalizeAlert = async () => {
  if (!canFinalize.value || !alertDetails.value) return

  try {
    const data =
      userRole.value === 'agent'
        ? {
            problem_id: selectedProblem.value ?? undefined,
            notes: resolutionNotes.value,
          }
        : {
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
  isLoading.value = true
  await fetchAlertDetails()

  if (userRole.value === 'agent') {
    await fetchProblems()
  } else {
    await fetchAgents()
  }
  isLoading.value = false

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

  &__no-agents {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 16px;
    text-align: center;
    color: #6b7280;
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
