<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { createPerson, updatePerson } from '../services/personService'
import { getRegions } from '../services/regionService'
import type { PersonRequest, PersonResponse, Region } from '../protocols/personProtocols'

interface Props {
  modelValue: boolean
  isEdit: boolean
  person?: PersonResponse | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const regions = ref<Region[]>([])
const loading = ref(false)

const formData = ref<PersonRequest>({
  name: '',
  whatsapp: '',
  email: '',
  password: '',
  role: 'ROLE_AGENTE',
  regions: [],
})

const isEditingAdmin = computed(() => {
  return props.isEdit && props.person?.role === 'ROLE_ADMIN'
})

const availableRoles = [
  { title: 'Agente', value: 'ROLE_AGENTE' },
  { title: 'Gestor', value: 'ROLE_GESTOR' },
]

async function loadRegions() {
  try {
    const response = await getRegions()
    regions.value = response.data
  } catch (error) {
    console.error('Erro ao carregar regiões:', error)
  }
}

function toggleRegion(region: Region) {
  const index = formData.value.regions.findIndex((r) => r.id === region.id)
  if (index > -1) {
    formData.value.regions.splice(index, 1)
  } else {
    formData.value.regions.push(region)
  }
}

function isRegionSelected(regionId: number): boolean {
  return formData.value.regions.some((r) => r.id === regionId)
}

function loadPersonData() {
  if (props.isEdit && props.person) {
    formData.value = {
      name: props.person.name,
      whatsapp: props.person.whatsapp || '',
      email: props.person.email || '',
      password: '',
      role: props.person.role,
      regions: props.person.regions.map((r) => ({ id: r.id, name: r.name })),
    }
  }
}

function resetForm() {
  formData.value = {
    name: '',
    whatsapp: '',
    email: '',
    password: '',
    role: 'ROLE_AGENTE',
    regions: [],
  }
}

async function handleSubmit() {
  try {
    loading.value = true

    if (props.isEdit && props.person) {
      await updatePerson(props.person.id, formData.value)
    } else {
      await createPerson(formData.value)
    }

    emit('saved')
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar pessoa:', error)
    alert('Erro ao salvar pessoa')
  } finally {
    loading.value = false
  }
}

function closeModal() {
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  (opened) => {
    if (opened) {
      loadRegions()
      if (props.isEdit) loadPersonData()
      else resetForm()
    }
  }
)
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    max-width="600"
    persistent
  >
    <v-card class="person-modal">
      <v-card-title class="person-modal__title">
        <v-icon class="mr-2">
          {{ isEdit ? 'mdi-pencil' : 'mdi-account-plus' }}
        </v-icon>
        {{ isEdit ? 'Editar Usuário' : 'Adicionar Usuário' }}
      </v-card-title>

      <v-card-text class="person-modal__content">
        <v-form @submit.prevent="handleSubmit">
          <v-text-field
            v-model="formData.name"
            label="Nome *"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            required
          />

          <v-text-field
            v-model="formData.email"
            label="Email"
            type="email"
            placeholder="exemplo@email.com"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />

          <v-text-field
            v-model="formData.whatsapp"
            label="WhatsApp"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />

          <v-text-field
            v-model="formData.password"
            :label="isEdit ? 'Senha (deixe vazio para não alterar)' : 'Senha'"
            type="password"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />

          <v-select
            v-model="formData.role"
            label="Perfil *"
            :items="availableRoles"
            :disabled="isEditingAdmin"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            required
          />

          <div class="person-modal__regions-group">
            <label class="person-modal__regions-label">Zonas Responsáveis *</label>

            <div class="person-modal__regions-checkboxes">
              <v-checkbox
                v-for="region in regions"
                :key="region.id"
                :label="region.name"
                :model-value="isRegionSelected(region.id)"
                @update:model-value="toggleRegion(region)"
                density="compact"
                hide-details
              />
            </div>
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions class="person-modal__actions">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="closeModal" :disabled="loading">Cancelar</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="handleSubmit"
          :loading="loading"
        >
          {{ isEdit ? 'Atualizar' : 'Salvar' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
.person-modal {
  border-radius: 12px;

  &__title {
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

  &__actions {
    border-top: 1px solid #e5e7eb;
    padding: 16px 20px;
  }

  &__regions-group {
    margin-top: 16px;
  }

  &__regions-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 12px;
  }

  &__regions-checkboxes {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 8px;
  }
}
</style>
