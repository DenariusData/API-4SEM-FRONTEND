<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  causeId: number | null
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

const show = ref(props.modelValue)
watch(
  () => props.modelValue,
  (value) => {
    show.value = value
  },
)

function close() {
  emit('update:modelValue', false)
}

function confirmDelete() {
  if (props.causeId !== null) {
    emit('confirm', props.causeId)
  }
  close()
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Confirmar Exclusão</h2>
        <button @click="close" class="modal-close">×</button>
      </div>
      <div class="modal-body">
        <div class="delete-icon-wrapper">
          <span class="delete-icon">🗑️</span>
        </div>
        <p class="delete-title">Tem certeza que deseja excluir esta causa raiz?</p>
        <p class="delete-warning">Esta ação não pode ser desfeita.</p>
        <div class="modal-actions">
          <button @click="close" class="btn btn-secondary">Cancelar</button>
          <button @click="confirmDelete" class="btn btn-danger">Excluir</button>
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
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 12px 24px;
  border-bottom: 1px solid #e5e7eb;

  h2 {
    font-size: 1.3rem;
    color: #d32f2f;
    margin: 0;
    font-weight: 700;
    letter-spacing: 0.5px;
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
    transition: background 0.2s;
    &:hover {
      background: #f3f4f6;
      color: #d32f2f;
    }
  }
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.delete-icon-wrapper {
  margin-bottom: 12px;
}
.delete-icon {
  font-size: 2.5rem;
  color: #d32f2f;
  display: block;
  margin: 0 auto;
}
.delete-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  margin-bottom: 8px;
}
.delete-warning {
  font-size: 0.95rem;
  color: #d32f2f;
  text-align: center;
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
  justify-content: center;
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

  &-secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #e5e7eb;
    &:hover {
      background: #e5e7eb;
    }
  }
  &-danger {
    background: linear-gradient(135deg, #ff5252 0%, #d32f2f 100%);
    color: white;
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(211, 47, 47, 0.18);
      background: #b71c1c;
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

@media (max-width: 480px) {
  .modal-content {
    margin: 10px;
    max-width: 98vw;
  }
  .modal-body {
    padding: 16px;
  }
}
</style>
