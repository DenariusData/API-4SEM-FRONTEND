<template>
  <div>
    <v-card class="problem-identification__card">
      <v-card-title class="problem-identification__card-title">
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

        <div v-if="problems.length === 0" class="problem-identification__no-problems">
          <v-icon color="warning" size="32">mdi-alert</v-icon>
          <p class="mt-2">Nenhum problema registrado encontrado.</p>
          <v-btn color="success" variant="tonal" class="mt-3" @click="$emit('contact-manager')">
            <v-icon start>mdi-whatsapp</v-icon>
            Contatar Gestor pelo WhatsApp
          </v-btn>
          <p class="text-caption mt-2">
            Contate o gestor para solicitar a criação do problema e protocolo apropriados.
          </p>
        </div>
      </v-card-text>
    </v-card>

    <v-card v-if="selectedProblemId" class="problem-identification__card mt-4">
      <v-card-title class="problem-identification__card-title">
        <v-icon class="mr-2">mdi-format-list-checkbox</v-icon>
        Protocolo de Resolução
      </v-card-title>
      <v-card-text>
        <div v-if="isLoadingProtocol" class="problem-identification__protocol-loading">
          <v-progress-circular indeterminate size="32" color="primary"></v-progress-circular>
          <p>Carregando protocolo...</p>
        </div>

        <div v-else-if="protocol" class="problem-identification__protocol">
          <h3 class="problem-identification__protocol-title">{{ protocol.name }}</h3>
          <div class="problem-identification__protocol-description">
            <ol class="problem-identification__protocol-steps">
              <li v-for="(step, index) in protocolSteps" :key="index">{{ step }}</li>
            </ol>
          </div>
          <div class="problem-identification__protocol-meta">
            <v-chip size="small" color="primary" variant="tonal"> Criado por: {{ protocol.createdByName }} </v-chip>
          </div>
        </div>

        <div v-else class="problem-identification__no-protocol-container">
          <div class="problem-identification__no-protocol-icon">
            <v-icon size="48" color="warning">mdi-file-document-alert-outline</v-icon>
          </div>
          <div class="problem-identification__no-protocol-content">
            <h4 class="problem-identification__no-protocol-title">Protocolo não encontrado</h4>
            <p class="problem-identification__no-protocol-text">
              O protocolo para este problema ainda não foi criado. Entre em contato com o gestor para solicitar sua
              criação.
            </p>
            <v-btn color="success" variant="flat" class="mt-3" @click="$emit('contact-manager')">
              <v-icon start>mdi-whatsapp</v-icon>
              Contatar Gestor pelo WhatsApp
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-card v-if="protocol" class="problem-identification__card mt-4">
      <v-card-title class="problem-identification__card-title">
        <v-icon class="mr-2">mdi-note-text</v-icon>
        Anotações de Resolução
      </v-card-title>
      <v-card-text>
        <v-textarea
          v-model="resolutionNotes"
          label="Descreva como o problema foi resolvido"
          variant="outlined"
          rows="4"
          placeholder="Ex.: Acidente removido, estrada reaberta às 14:30. Sem feridos."
          @update:model-value="$emit('update:resolution-notes', $event)"
        ></v-textarea>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Problem, Protocol } from '@/modules/alerts/types/alertsTypes'
import protocolsServices from '@/modules/protocols/services/protocolsServices'

interface Props {
  problems: Problem[]
  modelValue: number | null
  resolutionNotes: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:model-value', value: number | null): void
  (e: 'update:resolution-notes', value: string): void
  (e: 'contact-manager'): void
}>()

const selectedProblem = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:model-value', value),
})

const resolutionNotes = computed({
  get: () => props.resolutionNotes,
  set: (value) => emit('update:resolution-notes', value),
})

const selectedProblemId = computed(() => selectedProblem.value)

const selectedProblemDescription = computed(() => {
  if (!selectedProblem.value) return ''
  const problem = props.problems.find((p) => p.id === selectedProblem.value)
  return problem?.description || ''
})

const isLoadingProtocol = ref(false)
const protocol = ref<Protocol | null>(null)

const protocolSteps = computed(() => {
  if (!protocol.value?.description) return []
  return protocol.value.description.split('|-|').map(step => step.trim())
})

const onProblemSelected = async (problemId: number) => {
  if (!problemId) {
    protocol.value = null
    return
  }

  try {
    isLoadingProtocol.value = true
    const response = await protocolsServices.getProtocolByRootCause(problemId)
    protocol.value = response.data
  } catch (err) {
    console.error('Error fetching protocol:', err)
    protocol.value = null
  } finally {
    isLoadingProtocol.value = false
  }
}
</script>

<style lang="scss" scoped>
.problem-identification {
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

  &__no-problems {
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

  &__protocol {
    padding: 16px 0;
  }

  &__protocol-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 16px;
  }

  &__protocol-description {
    margin-bottom: 16px;
  }

  &__protocol-steps {
    color: #374151;
    line-height: 1.8;
    margin: 0;
    padding-left: 24px;

    li {
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  &__protocol-meta {
    margin-top: 12px;
  }

  &__no-protocol-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 40px 24px;
  }

  &__no-protocol-icon {
    margin-bottom: 20px;
    animation: pulse 2s ease-in-out infinite;
  }

  &__no-protocol-content {
    max-width: 500px;
  }

  &__no-protocol-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 12px;
  }

  &__no-protocol-text {
    font-size: 0.95rem;
    color: #6b7280;
    line-height: 1.6;
    margin: 0;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }
}
</style>
