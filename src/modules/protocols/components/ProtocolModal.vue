<script setup lang="ts">
import type { CausaRaiz, FormProtocolo } from '@/modules/protocols/types/ProtocolsTypes'

interface Props {
  show: boolean
  formData: FormProtocolo
  causas: CausaRaiz[]
  isEditing: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'save'): void
  (e: 'update:formData', value: FormProtocolo): void
  (e: 'add-passo'): void
  (e: 'remove-passo', index: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const updateField = (field: keyof FormProtocolo, value: unknown) => {
  emit('update:formData', { ...props.formData, [field]: value } as FormProtocolo)
}

const PASSOS_LIMIT = 228
const getTotalPassosLength = () => props.formData.passos.reduce((acc, p) => acc + p.length, 0)

const updatePasso = (index: number, value: string) => {
  const totalLength = getTotalPassosLength() - props.formData.passos[index].length + value.length
  let newValue = value
  if (totalLength > PASSOS_LIMIT) {
    // Limita o valor para não ultrapassar o limite no total
    const allowed = PASSOS_LIMIT - (getTotalPassosLength() - props.formData.passos[index].length)
    newValue = value.slice(0, allowed)
  }
  const newPassos = [...props.formData.passos]
  newPassos[index] = newValue
  updateField('passos', newPassos)
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ isEditing ? 'Editar' : 'Novo' }} Protocolo</h2>
        <button @click="emit('close')" class="modal-close">×</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>Título do Protocolo *</label>
          <input
            :value="formData.titulo"
            @input="updateField('titulo', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Ex: Protocolo para Acidentes"
          />
        </div>

        <div class="form-group">
          <label>Descrição</label>
          <textarea
            :value="formData.description"
            @input="
              (e) => {
                const val = (e.target as HTMLTextAreaElement).value.slice(0, 255)
                updateField('description', val)
              }
            "
            :maxlength="255"
            placeholder="Descreva o objetivo deste protocolo... (máx. 255 caracteres)"
            rows="2"
          />
          <div class="char-counter">{{ formData.description.length }}/255 caracteres</div>
        </div>

        <div class="form-group">
          <label>Causa Raiz Associada *</label>
          <select
            :value="formData.causaRaizId"
            @change="updateField('causaRaizId', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">Selecione uma causa raiz</option>
            <option v-for="c in causas.filter((c) => c.ativo)" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>
          <small>Apenas causas ativas estão disponíveis</small>
        </div>

        <div class="form-group">
          <div class="form-group-header">
            <label>Passos do Protocolo *</label>
            <button @click="emit('add-passo')" class="btn-link small">+ Adicionar Passo</button>
          </div>
          <div class="passos-list">
            <div v-for="(passo, index) in formData.passos" :key="index">
              <div class="passo-titulo">
                <span class="passo-number">{{ index + 1 }}.</span>
                <button
                  v-if="formData.passos.length > 1"
                  @click="emit('remove-passo', index)"
                  class="btn-icon-only btn-danger small"
                  title="Remover passo"
                >
                  🗑
                </button>
              </div>
              <textarea
                :value="passo"
                @input="updatePasso(index, ($event.target as HTMLTextAreaElement).value)"
                :maxlength="PASSOS_LIMIT - (getTotalPassosLength() - passo.length)"
                rows="2"
                placeholder="Descreva o passo do protocolo"
              ></textarea>
            </div>
          </div>
          <div class="char-counter">{{ getTotalPassosLength() }}/{{ PASSOS_LIMIT }} caracteres</div>
          <small>A soma dos caracteres de todos os passos não pode ultrapassar {{ PASSOS_LIMIT }}.</small>
        </div>

        <div class="modal-actions">
          <button @click="emit('close')" class="btn btn-secondary">Cancelar</button>
          <button @click="emit('save')" class="btn btn-primary">
            {{ isEditing ? 'Atualizar' : 'Criar' }} Protocolo
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
  select,
  textarea {
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
  }

  textarea {
    resize: vertical;
    min-height: 60px;
  }

  small {
    display: block;
    margin-top: 6px;
    font-size: 0.8rem;
    color: #6b7280;
  }

  .passos-list {
    .passo-titulo {
      display: flex;
      justify-content: space-between;
    }
  }

  .char-counter {
    text-align: right;
    font-size: 0.8rem;
    color: #6b7280;
    margin-top: 2px;
  }
}

.form-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  label {
    margin: 0;
  }
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}

.step-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;

  .step-number {
    font-weight: 600;
    color: #6b7280;
    padding-top: 10px;
    flex-shrink: 0;
  }

  textarea {
    flex: 1;
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

  &-primary {
    background: linear-gradient(135deg, #00c853 0%, #00963e 100%);
    color: white;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 150, 62, 0.3);
    }
  }

  &-secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #e5e7eb;

    &:hover {
      background: #e5e7eb;
    }
  }

  &-link {
    background: none;
    border: none;
    color: #00963e;
    cursor: pointer;
    font-weight: 500;
    padding: 4px 8px;
    font-size: 0.95rem;

    &:hover {
      text-decoration: underline;
    }

    &.small {
      font-size: 0.85rem;
    }
  }

  &-icon-only {
    background: none;
    border: none;
    padding: 8px;
    cursor: pointer;
    color: #6b7280;
    font-size: 1.1rem;
    border-radius: 6px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: #f3f4f6;
      color: #374151;
    }

    &.btn-danger:hover {
      background: #fef2f2;
      color: #991b1b;
    }

    &.small {
      padding: 4px;
      font-size: 0.9rem;
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
}
</style>
