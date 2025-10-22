<script setup lang="ts">
import { ref } from 'vue';
import type { CausaRaiz, Protocolo } from '@/modules/protocols/types/ProtocolsTypes';

interface Props {
  protocols: Protocolo[];
  rootCauses: CausaRaiz[];
}

interface Emits {
  (e: 'open-modal', protocolo: Protocolo | null): void;
  (e: 'delete', id: number): void;
  (e: 'change-tab'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const expandedProtocol = ref<number | null>(null);
</script>

<template>
  <div class="tab-panel">
    <div class="panel-header">
      <div>
        <h2>Protocolos</h2>
        <p>Defina os protocolos de resolução para cada causa raiz</p>
      </div>
      <button
        @click="emit('open-modal', null)"
        :disabled="rootCauses.filter(c => c.ativo).length === 0"
        :class="['btn btn-primary', { disabled: rootCauses.filter(c => c.ativo).length === 0 }]"
      >
        <span class="btn-icon">+</span>
        Novo Protocolo
      </button>
    </div>

    <div v-if="rootCauses.filter(c => c.ativo).length === 0" class="empty-state warning">
      <span class="empty-icon">⚠</span>
      <p class="empty-title">Nenhuma causa raiz ativa</p>
      <p>Crie ou ative uma causa raiz antes de criar protocolos</p>
      <button @click="emit('change-tab')" class="btn-link">
        Ir para Causas Raiz
      </button>
    </div>

    <div v-else-if="protocols.length === 0" class="empty-state">
      <span class="empty-icon">📄</span>
      <p>Nenhum protocolo cadastrado</p>
      <button @click="emit('open-modal', null)" class="btn-link">
        Criar primeiro protocolo
      </button>
    </div>

    <div v-else class="items-list">
      <div v-for="protocolo in protocols" :key="protocolo.id" class="item-card protocol-card">
        <div class="item-content">
          <div class="item-main">
            <h3>{{ protocolo.titulo }}</h3>
            <p class="item-info">
              <strong>Causa Raiz:</strong>
              {{ rootCauses.find(c => c.id === protocolo.causaRaizId)?.nome }}
              <span v-if="!rootCauses.find(c => c.id === protocolo.causaRaizId)?.ativo" class="badge badge-warning">
                Causa Inativa
              </span>
            </p>
            <p class="item-meta">{{ protocolo.passos.length }} passos definidos</p>
          </div>
          <div class="item-actions">
            <button
              @click="expandedProtocol = expandedProtocol === protocolo.id ? null : protocolo.id"
              class="btn-icon-only"
              :title="expandedProtocol === protocolo.id ? 'Ocultar passos' : 'Ver passos'"
            >
              {{ expandedProtocol === protocolo.id ? '▲' : '▼' }}
            </button>
            <button @click="emit('open-modal', protocolo)" class="btn-icon-only" title="Editar">
              ✎
            </button>
            <button @click="emit('delete', protocolo.id)" class="btn-icon-only btn-danger" title="Excluir">
              🗑
            </button>
          </div>
        </div>

        <div v-if="expandedProtocol === protocolo.id" class="protocol-steps">
          <h4>Passos do Protocolo:</h4>
          <ol>
            <li v-for="(passo, index) in protocolo.passos" :key="index">
              {{ passo }}
            </li>
          </ol>
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

    &:hover:not(.disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 150, 62, 0.3);
    }

    &.disabled {
      background: #9ca3af;
      cursor: not-allowed;
      opacity: 0.6;
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

  &.warning {
    background: #fffbeb;
    border-color: #fde68a;
  }

  .empty-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 16px;
  }

  p {
    color: #6b7280;
    margin: 8px 0;
  }

  .empty-title {
    font-weight: 600;
    color: #374151;
    font-size: 1.1rem;
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

  h3 {
    font-size: 1.15rem;
    color: #1f2937;
    margin: 0 0 12px 0;
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

  .item-meta {
    font-size: 0.85rem;
    color: #9ca3af;
    margin-top: 8px;
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

  &-warning {
    background: #fef3c7;
    color: #92400e;
  }
}

.protocol-steps {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 16px;
  border-radius: 6px;

  h4 {
    font-size: 1rem;
    color: #1f2937;
    margin: 0 0 12px 0;
    font-weight: 600;
  }

  ol {
    margin: 0;
    padding-left: 20px;

    li {
      font-size: 0.9rem;
      color: #374151;
      margin-bottom: 8px;
      line-height: 1.5;

      &::marker {
        color: #00963e;
        font-weight: 600;
      }
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
