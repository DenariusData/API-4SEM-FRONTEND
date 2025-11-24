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
  },
)
</script>

<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ isEdit ? 'Editar' : 'Adicionar' }} Usuário</h2>
        <button @click="closeModal" class="modal-close">×</button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Nome *</label>
            <input v-model="formData.name" type="text" placeholder="Digite o nome completo" required />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input v-model="formData.email" type="email" placeholder="exemplo@email.com" />
          </div>

          <div class="form-group">
            <label>WhatsApp</label>
            <input v-model="formData.whatsapp" type="text" placeholder="(11) 99999-9999" />
          </div>

          <div class="form-group">
            <label>{{ isEdit ? 'Senha (deixe vazio para não alterar)' : 'Senha *' }}</label>
            <input v-model="formData.password" type="password" placeholder="Digite a senha" :required="!isEdit" />
          </div>

          <div class="form-group">
            <label>Perfil *</label>
            <select v-model="formData.role" :disabled="isEditingAdmin" required>
              <option value="">Selecione um perfil</option>
              <option v-for="role in availableRoles" :key="role.value" :value="role.value">
                {{ role.title }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Zonas Responsáveis *</label>
            <div class="regions-grid">
              <label v-for="region in regions" :key="region.id" class="checkbox-label">
                <input type="checkbox" :checked="isRegionSelected(region.id)" @change="toggleRegion(region)" />
                {{ region.name }}
              </label>
            </div>
          </div>
        </form>

        <div class="modal-actions">
          <button @click="closeModal" class="btn btn-secondary" :disabled="loading">Cancelar</button>
          <button @click="handleSubmit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;

  h2 {
    font-size: 1.5rem;
    color: #1f2937;
    margin: 0;
    font-weight: 600;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #9ca3af;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;

    &:hover {
      background: #f3f4f6;
      color: #6b7280;
    }
  }
}

.modal-body {
  padding: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;

  .btn {
    flex: 1;
  }
}

.form-group {
  margin-bottom: 20px;

  label {
    display: block;
    font-size: 0.9rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 8px;
  }

  input[type='text'],
  input[type='email'],
  input[type='password'],
  textarea,
  select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: all 0.2s;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: #00963e;
      box-shadow: 0 0 0 3px rgba(0, 150, 62, 0.1);
    }

    &::placeholder {
      color: #9ca3af;
    }

    &:disabled {
      background: #f9fafb;
      color: #6b7280;
      cursor: not-allowed;
    }
  }

  select {
    cursor: pointer;

    &:disabled {
      cursor: not-allowed;
    }
  }
}

.regions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #374151;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s;

  &:hover {
    background: #f3f4f6;
  }

  input[type='checkbox'] {
    width: auto;
    cursor: pointer;
    margin: 0;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  &-primary {
    background: linear-gradient(135deg, #00c853 0%, #00963e 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 150, 62, 0.3);
    }
  }

  &-secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #e5e7eb;

    &:hover:not(:disabled) {
      background: #e5e7eb;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-height: 95vh;
  }

  .modal-actions {
    flex-direction: column;

    .btn {
      width: 100%;
    }
  }

  .regions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
