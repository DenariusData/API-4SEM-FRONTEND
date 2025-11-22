<script setup lang="ts">
import type { CausaRaiz, Protocolo } from '@/modules/protocols/types/ProtocolsTypes'

interface Props {
  rootCauses: CausaRaiz[]
  protocols: Protocolo[]
}

interface Emits {
  (e: 'open-modal', causa: CausaRaiz | null): void
  (e: 'toggle', id: number): void
  (e: 'delete', id: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <div class="tab-panel">
    <div class="panel-header">
      <div>
        <h2>Causas Raiz</h2>
        <p>Defina as causas raiz que geram alertas no sistema</p>
      </div>
      <button @click="emit('open-modal', null)" class="btn btn-primary">
        <span class="btn-icon">+</span>
        Nova Causa Raiz
      </button>
    </div>

    <div v-if="rootCauses.length === 0" class="empty-state">
      <span class="empty-icon">⚠</span>
      <p>Nenhuma causa raiz cadastrada</p>
      <button @click="emit('open-modal', null)" class="btn-link">Criar primeira causa raiz</button>
    </div>

    <div v-else class="items-list">
      <div v-for="causa in rootCauses" :key="causa.id" class="item-card">
        <div class="item-content">
          <div class="item-main">
            <div class="item-header-row">
              <h3>{{ causa.name }}</h3>
              <span :class="['badge', causa.ativo ? 'badge-success' : 'badge-inactive']">
                {{ causa.ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </div>
            <p class="item-info" v-if="causa.description"><strong>Descrição:</strong> {{ causa.description }}</p>
            <p class="item-info" v-if="causa.protocolName">
              <strong>Protocolo associado:</strong> {{ causa.protocolName }}
            </p>
          </div>
          <div class="item-actions">
            <button
              @click="emit('toggle', causa.id)"
              :class="['btn-action', causa.ativo ? 'btn-deactivate' : 'btn-activate']"
            >
              {{ causa.ativo ? 'Desativar' : 'Ativar' }}
            </button>
            <button @click="emit('open-modal', causa)" class="btn-icon-only" title="Editar">✎</button>
            <button @click="emit('delete', causa.id)" class="btn-icon-only btn-danger" title="Excluir">🗑</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tab-panel {
  animation: fadeIn 0.3s ease-out;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 20px;

  h2 {
    font-size: 1.5rem;
    color: #1f2937;
    margin: 0 0 4px 0;
    font-weight: 600;
  }

  p {
    font-size: 0.9rem;
    color: #6b7280;
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
  white-space: nowrap;

  &-primary {
    background: linear-gradient(135deg, #00c853 0%, #00963e 100%);
    color: white;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 150, 62, 0.3);
    }
  }

  &-action {
    padding: 6px 12px;
    font-size: 0.85rem;
    border-radius: 6px;
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #e5e7eb;

    &:hover {
      background: #e5e7eb;
    }
  }

  &-deactivate {
    background: #fef2f2;
    color: #991b1b;
    border: 1px solid #fecaca;

    &:hover {
      background: #fee2e2;
    }
  }

  &-activate {
    background: #f0fdf4;
    color: #166534;
    border: 1px solid #bbf7d0;

    &:hover {
      background: #dcfce7;
    }
  }

  &-icon {
    font-size: 1.2rem;
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
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #f9fafb;
  border-radius: 8px;
  border: 2px dashed #e5e7eb;

  .empty-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 16px;
  }

  p {
    color: #6b7280;
    margin: 8px 0;
  }
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #d1d5db;
  }

  .item-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }

  .item-main {
    flex: 1;
  }

  .item-header-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  h3 {
    font-size: 1.15rem;
    color: #1f2937;
    margin: 0;
    font-weight: 600;
  }

  .item-info {
    font-size: 0.9rem;
    color: #6b7280;
    margin: 6px 0;

    strong {
      color: #374151;
    }
  }

  .item-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;

  &-success {
    background: #dcfce7;
    color: #166534;
  }

  &-inactive {
    background: #f3f4f6;
    color: #6b7280;
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

@media (max-width: 768px) {
  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .item-card .item-content {
    flex-direction: column;
  }

  .item-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
