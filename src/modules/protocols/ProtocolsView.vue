<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type {
  CausaRaiz,
  Protocolo,
  Alert,
  FormCausa,
  FormProtocolo,
  ModalType,
  TabType,
} from '@/modules/protocols/types/ProtocolsTypes'
import {
  initialFormCausa,
  initialFormProtocolo,
  mapProtocolToFrontend,
  mapCausaToBackend,
  mapProtocoloToBackend,
} from '@/modules/protocols/types/ProtocolsTypes'
import protocolsService from '@/modules/protocols/services/protocolsServices'
import type { RootCauseBackendDTO } from '@/modules/protocols/services/protocolsServices'

import AlertMessage from '@/modules/protocols/components/AlertMessage.vue'
import RootCausesTab from '@/modules/protocols/components/RootCausesTab.vue'
import ProtocolsTab from '@/modules/protocols/components/ProtocolsTab.vue'
import RootCauseModal from '@/modules/protocols/components/RootCauseModal.vue'
import ProtocolModal from '@/modules/protocols/components/ProtocolModal.vue'
import ProtocolDeleteModal from '@/modules/protocols/components/ProtocolDeleteModal.vue'
import RootCauseDeleteModal from '@/modules/protocols/components/RootCauseDeleteModal.vue'

const activeTab = ref<TabType>('causas')
const showModal = ref(false)
const modalType = ref<ModalType>('causa')
const editingItem = ref<CausaRaiz | Protocolo | null>(null)
const showAlert = ref<Alert | null>(null)
const isLoading = ref(false)
const protocolToDelete = ref<number | null>(null)
const showDeleteModal = ref(false)
const causeToDelete = ref<number | null>(null)
const showDeleteCauseModal = ref(false)

const causasRaiz = ref<CausaRaiz[]>([])
const protocolos = ref<Protocolo[]>([])

const formCausa = ref<FormCausa>({ ...initialFormCausa })
const formProtocolo = ref<FormProtocolo>({ ...initialFormProtocolo })

const loadRootCauses = async () => {
  try {
    isLoading.value = true
    const response = await protocolsService.getAllRootCauses()
    causasRaiz.value = response.data.map((rc: RootCauseBackendDTO) => ({
      ...rc,
      ativo: true,
      protocolName: rc.protocolName || '',
    }))
  } catch (error) {
    console.error('Erro ao carregar causas raiz:', error)
    showAlertMessage('error', 'Erro ao carregar causas raiz do servidor')
  } finally {
    isLoading.value = false
  }
}

const loadProtocols = async () => {
  try {
    isLoading.value = true
    const response = await protocolsService.getAllProtocols()
    protocolos.value = response.data.map((p) => {
      const passos = p.description ? p.description.split(' |-| ') : [p.description]
      return mapProtocolToFrontend(p, 1, passos)
    })
  } catch (error) {
    console.error('Erro ao carregar protocolos:', error)
    showAlertMessage('error', 'Erro ao carregar protocolos do servidor')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => Promise.all([loadRootCauses(), loadProtocols()]))

const openModalCausa = (item: CausaRaiz | null = null) => {
  modalType.value = 'causa'
  editingItem.value = item
  formCausa.value = item
    ? {
        name: item.name,
        description: item.description || '',
        ativo: item.ativo,
      }
    : { ...initialFormCausa }
  showModal.value = true
}

const openModalProtocolo = (item: Protocolo | null = null) => {
  modalType.value = 'protocolo'
  editingItem.value = item
  formProtocolo.value = item
    ? {
        titulo: item.titulo,
        description: item.description || '',
        causaRaizId: item.causaRaizId,
        passos: [...item.passos],
      }
    : { ...initialFormProtocolo }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingItem.value = null
  formCausa.value = { ...initialFormCausa }
  formProtocolo.value = { ...initialFormProtocolo }
}

const showAlertMessage = (type: Alert['type'], message: string) => {
  showAlert.value = { type, message }
  setTimeout(() => (showAlert.value = null), 4000)
}

const handleSaveCausa = async () => {
  if (!formCausa.value.name) {
    showAlertMessage('error', 'Preencha todos os campos obrigatórios')
    return
  }

  try {
    isLoading.value = true

    const createdBy = 1
    const backendData = mapCausaToBackend(formCausa.value, createdBy)

    if (editingItem.value) {
      const response = await protocolsService.updateRootCause((editingItem.value as CausaRaiz).id, backendData)
      const updatedCausa = {
        ...response.data,
        ativo: formCausa.value.ativo,
        protocolName: response.data.protocolName || '',
      }

      causasRaiz.value = causasRaiz.value.map((c) => (c.id === updatedCausa.id ? updatedCausa : c))
      showAlertMessage('success', 'Causa raiz atualizada com sucesso')
    } else {
      const response = await protocolsService.createRootCause(backendData)
      const novaCausa = {
        ...response.data,
        ativo: formCausa.value.ativo,
        protocolName: response.data.protocolName || '',
      }

      causasRaiz.value.push(novaCausa)
      showAlertMessage('success', 'Causa raiz criada com sucesso')
    }

    closeModal()
  } catch (error) {
    console.error('Erro ao salvar causa raiz:', error)
    showAlertMessage('error', 'Erro ao salvar causa raiz. Tente novamente.')
  } finally {
    isLoading.value = false
  }
}

function openDeleteCauseModal(id: number) {
  const protocolosAssociados = protocolos.value.filter((p) => p.causaRaizId === id)
  if (protocolosAssociados.length > 0) {
    showAlertMessage(
      'error',
      `Não é possível excluir. Esta causa possui ${protocolosAssociados.length} protocolo(s) associado(s). Desative a causa ou remova os protocolos primeiro.`,
    )
    return
  }
  causeToDelete.value = id
  showDeleteCauseModal.value = true
}

const handleConfirmDeleteCause = async (id: number) => {
  try {
    isLoading.value = true
    await protocolsService.deleteRootCause(id)
    causasRaiz.value = causasRaiz.value.filter((c) => c.id !== id)
    showAlertMessage('success', 'Causa raiz excluída com sucesso')
  } catch (error) {
    console.error('Erro ao excluir causa raiz:', error)
    showAlertMessage('error', 'Erro ao excluir causa raiz. Tente novamente.')
  } finally {
    isLoading.value = false
  }
}

const handleToggleCausa = (id: number) => {
  causasRaiz.value = causasRaiz.value.map((c) => (c.id === id ? { ...c, ativo: !c.ativo } : c))
  const causa = causasRaiz.value.find((c) => c.id === id)
  showAlertMessage('info', `Causa raiz ${causa?.ativo ? 'ativada' : 'desativada'} com sucesso`)
}

const handleSaveProtocolo = async () => {
  if (
    !formProtocolo.value.titulo ||
    !formProtocolo.value.causaRaizId ||
    formProtocolo.value.passos.filter((p) => p.trim()).length === 0
  ) {
    showAlertMessage('error', 'Preencha todos os campos obrigatórios e adicione pelo menos um passo')
    return
  }

  const passosLimpos = formProtocolo.value.passos.filter((p) => p.trim())

  try {
    isLoading.value = true

    const createdBy = 1
    const backendData = mapProtocoloToBackend(formProtocolo.value, createdBy)

    if (editingItem.value) {
      const response = await protocolsService.updateProtocol((editingItem.value as Protocolo).id, backendData)
      const updatedProtocolo = mapProtocolToFrontend(
        response.data,
        parseInt(String(formProtocolo.value.causaRaizId)),
        passosLimpos,
      )

      protocolos.value = protocolos.value.map((p) => (p.id === updatedProtocolo.id ? updatedProtocolo : p))
      showAlertMessage('success', 'Protocolo atualizado com sucesso')
    } else {
      const response = await protocolsService.createProtocol(backendData)
      const novoProtocolo = mapProtocolToFrontend(
        response.data,
        parseInt(String(formProtocolo.value.causaRaizId)),
        passosLimpos,
      )

      protocolos.value.push(novoProtocolo)
      showAlertMessage('success', 'Protocolo criado com sucesso')
    }

    closeModal()
  } catch (error) {
    console.error('Erro ao salvar protocolo:', error)
    showAlertMessage('error', 'Erro ao salvar protocolo. Tente novamente.')
  } finally {
    isLoading.value = false
  }
}

function openDeleteProtocolModal(id: number) {
  protocolToDelete.value = id
  showDeleteModal.value = true
}

const handleConfirmDeleteProtocol = async (id: number) => {
  try {
    isLoading.value = true
    await protocolsService.deleteProtocol(id)
    protocolos.value = protocolos.value.filter((p) => p.id !== id)
    showAlertMessage('success', 'Protocolo excluído com sucesso')
  } catch (error) {
    console.error('Erro ao excluir protocolo:', error)
    showAlertMessage('error', 'Erro ao excluir protocolo. Tente novamente.')
  } finally {
    isLoading.value = false
  }
}

const addStep = () => {
  formProtocolo.value.passos.push('')
}

const removeStep = (index: number) => {
  formProtocolo.value.passos = formProtocolo.value.passos.filter((_, i) => i !== index)
}
</script>

<template>
  <div class="protocols-view">
    <div class="page-header">
      <h1>Gerenciamento de Protocolos</h1>
      <p>Gerencie causas raiz e seus protocolos de resolução</p>
    </div>

    <AlertMessage :alert="showAlert" @close="showAlert = null" />

    <div class="tabs-container">
      <div class="tabs-header">
        <button @click="activeTab = 'causas'" :class="['tab-button', { active: activeTab === 'causas' }]">
          Causas Raiz
          <span class="tab-count">{{ causasRaiz.length }}</span>
        </button>
        <button @click="activeTab = 'protocolos'" :class="['tab-button', { active: activeTab === 'protocolos' }]">
          Protocolos
          <span class="tab-count">{{ protocolos.length }}</span>
        </button>
      </div>

      <div class="tabs-content">
        <RootCausesTab
          v-if="activeTab === 'causas'"
          :root-causes="causasRaiz"
          :protocols="protocolos"
          @open-modal="openModalCausa"
          @toggle="handleToggleCausa"
          @delete="openDeleteCauseModal"
        />
        <RootCauseDeleteModal
          v-model="showDeleteCauseModal"
          :cause-id="causeToDelete"
          @confirm="handleConfirmDeleteCause"
        />

        <ProtocolsTab
          v-if="activeTab === 'protocolos'"
          :protocols="protocolos"
          :root-causes="causasRaiz"
          @open-modal="openModalProtocolo"
          @delete="openDeleteProtocolModal"
          @change-tab="activeTab = 'causas'"
        />
      </div>
    </div>

    <RootCauseModal
      :show="showModal && modalType === 'causa'"
      :form-data="formCausa"
      :is-editing="!!editingItem"
      @close="closeModal"
      @save="handleSaveCausa"
      @update:form-data="formCausa = $event"
    />

    <ProtocolModal
      :show="showModal && modalType === 'protocolo'"
      :form-data="formProtocolo"
      :causas="causasRaiz"
      :is-editing="!!editingItem"
      @close="closeModal"
      @save="handleSaveProtocolo"
      @update:formData="formProtocolo = $event"
      @add-passo="addStep"
      @remove-passo="removeStep"
    />
    <ProtocolDeleteModal
      v-model="showDeleteModal"
      :protocol-id="protocolToDelete"
      @confirm="handleConfirmDeleteProtocol"
    />
  </div>
</template>

<style lang="scss" scoped>
.protocols-view {
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 20px;

  h1 {
    font-size: 2.5rem;
    color: #4d4d4d;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #222121 0%, #5a5b5a 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 700;
  }

  p {
    font-size: 1.1rem;
    color: #6b7280;
    margin: 0;
  }
}

.tabs-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.tab-button {
  flex: 1;
  padding: 16px 24px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    color: #374151;
    background: #f3f4f6;
  }

  &.active {
    color: #00963e;
    border-bottom-color: #00963e;
    background: white;
  }

  .tab-count {
    background: #e5e7eb;
    color: #6b7280;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  &.active .tab-count {
    background: #dcfce7;
    color: #00963e;
  }
}

.tabs-content {
  padding: 24px;
}

@media (max-width: 768px) {
  .protocols-view {
    padding: 12px;
    gap: 24px;
  }

  .page-header h1 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .tabs-header {
    flex-direction: column;
  }

  .tab-button {
    border-bottom: 1px solid #e5e7eb;
    border-right: none;

    &.active {
      border-bottom-color: #00963e;
      border-left: 3px solid #00963e;
    }
  }
}
</style>
