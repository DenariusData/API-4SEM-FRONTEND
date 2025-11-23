<script setup lang="ts">
import type { Alert } from '@/modules/protocols/types/ProtocolsTypes'

interface Props {
  alert: Alert | null
}

interface Emits {
  (e: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <transition name="toast-fade">
    <div v-if="alert" :class="['alert', `alert-${alert.type}`]" class="alert-toast" role="alert">
      <span class="alert-icon">
        <span v-if="alert.type === 'success'">✓</span>
        <span v-else-if="alert.type === 'error'">✕</span>
        <span v-else-if="alert.type === 'warning'">⚠</span>
        <span v-else>ℹ</span>
      </span>
      <span class="alert-message">{{ alert.message }}</span>
      <button @click="emit('close')" class="alert-close">×</button>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
.alert-toast {
  position: fixed;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  min-width: 320px;
  max-width: 90vw;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  margin-bottom: 0;
  pointer-events: auto;
}

.alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 8px;
  animation: none;

  &-success {
    background-color: #f0fdf4;
    color: #166534;
    border: 1px solid #bbf7d0;
  }

  &-error {
    background-color: #fef2f2;
    color: #991b1b;
    border: 1px solid #fecaca;
  }

  &-warning {
    background-color: #fffbeb;
    color: #92400e;
    border: 1px solid #fde68a;
  }

  &-info {
    background-color: #eff6ff;
    color: #1e40af;
    border: 1px solid #bfdbfe;
  }

  .alert-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .alert-message {
    flex: 1;
    font-size: 0.95rem;
  }

  .alert-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: currentColor;
    opacity: 0.7;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      opacity: 1;
    }
  }
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition:
    opacity 0.3s,
    top 0.3s;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  top: 0px;
}
.toast-fade-enter-to,
.toast-fade-leave-from {
  opacity: 1;
  top: 32px;
}
</style>
