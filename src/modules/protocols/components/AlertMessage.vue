<script setup lang="ts">
import type { Alert } from '@/modules/protocols/types/ProtocolsTypes';

interface Props {
  alert: Alert | null;
}

interface Emits {
  (e: 'close'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();
</script>

<template>
  <div v-if="alert" :class="['alert', `alert-${alert.type}`]">
    <span class="alert-icon">
      <span v-if="alert.type === 'success'">✓</span>
      <span v-else-if="alert.type === 'error'">✕</span>
      <span v-else-if="alert.type === 'warning'">⚠</span>
      <span v-else>ℹ</span>
    </span>
    <span class="alert-message">{{ alert.message }}</span>
    <button @click="emit('close')" class="alert-close">×</button>
  </div>
</template>

<style lang="scss" scoped>
.alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  animation: slideIn 0.3s ease-out;

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

@keyframes slideIn {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
