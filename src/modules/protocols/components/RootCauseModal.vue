<script setup lang="ts">
import type { FormCausa } from '@/modules/protocols/types/ProtocolsTypes'

interface Props {
  show: boolean
  formData: FormCausa
  isEditing: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'save'): void
  (e: 'update:formData', value: FormCausa): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const updateField = (field: keyof FormCausa, value: unknown) => {
  emit('update:formData', { ...props.formData, [field]: value } as FormCausa)
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ isEditing ? 'Editar' : 'Nova' }} Causa Raiz</h2>
        <button @click="emit('close')" class="modal-close">×</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>Nome da Causa Raiz *</label>
          <input
            :value="formData.name"
            @input="updateField('name', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Ex: Acidente de Trânsito"
          />
        </div>

        <div class="form-group">
          <label>Descrição</label>
          <textarea
            :value="formData.description"
            @input="updateField('description', ($event.target as HTMLTextAreaElement).value)"
            placeholder="Descreva os detalhes desta causa raiz..."
            rows="3"
          />
        </div>

        <div class="form-group checkbox-group">
          <label>
            <input
              :checked="formData.ativo"
              @change="updateField('ativo', ($event.target as HTMLInputElement).checked)"
              type="checkbox"
              id="ativo"
            />
            Causa Raiz Ativa
          </label>
        </div>

        <div class="modal-actions">
          <button @click="emit('save')" class="btn btn-primary">
            {{ isEditing ? 'Atualizar' : 'Criar' }} Causa Raiz
          </button>
          <button @click="emit('close')" class="btn btn-secondary">Cancelar</button>
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
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }

  small {
    display: block;
    margin-top: 6px;
    font-size: 0.8rem;
    color: #6b7280;
  }

  &.checkbox-group {
    label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      input[type='checkbox'] {
        width: auto;
        cursor: pointer;
      }
    }
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
