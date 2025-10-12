<script setup lang="ts">
import { ref, onBeforeUnmount, watch, computed } from 'vue'
import type { SelectedLevel } from '@/modules/indicators/enums'

interface Props {
  selectedLevel: SelectedLevel
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
})

const isVisible = ref(false)

const emit = defineEmits<{
  close: []
  'update:visible': [value: boolean]
}>()

const openModal = () => {
  isVisible.value = true
  document.body.style.overflow = 'hidden'
  emit('update:visible', true)
}

const closeModal = () => {
  isVisible.value = false
  document.body.style.overflow = 'auto'
  emit('close')
  emit('update:visible', false)
}

watch(
  () => props.visible,
  (newValue) => {
    if (newValue && !isVisible.value) {
      openModal()
    } else if (!newValue && isVisible.value) {
      closeModal()
    }
  },
  { immediate: true },
)

const levelColor = computed(() => {
  switch (props.selectedLevel.value) {
    case 1:
      return 'linear-gradient(135deg, #10b981, #059669)'
    case 2:
      return 'linear-gradient(135deg, #22c55e, #16a34a)'
    case 3:
      return 'linear-gradient(135deg, #f59e0b, #d97706)'
    case 4:
      return 'linear-gradient(135deg, #ef4444, #dc2626)'
    case 5:
      return 'linear-gradient(135deg, #991b1b, #7f1d1d)'
    default:
      return 'linear-gradient(135deg, #00c853 0%, #00963e 100%)'
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = 'auto'
})

defineExpose({
  openModal,
})
</script>

<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header" :style="{ background: levelColor }">
        <h2>Nível {{ props.selectedLevel.value }}</h2>
        <button class="close-btn" @click="closeModal" aria-label="Fechar modal">×</button>
      </div>

      <div class="modal-content">
        <div class="level-modal-content">
          <h4>O que significa este nível?</h4>
          <p>
            Este nível indica uma situação <strong>{{ props.selectedLevel.name.toLowerCase() }}</strong> no trânsito
            urbano.
          </p>
          <p>
            Todos os critérios de mobilidade utilizam essa classificação para determinar a condição das vias
            monitoradas.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 20px;
  max-width: 500px;
  max-height: 90vh;
  width: 100%;
  overflow-y: auto;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
  animation: modalAppear 0.3s ease-out;
}

.modal-header {
  padding: 32px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  border-radius: 20px 20px 0 0;

  h2 {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 600;
  }
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 12px;
  border-radius: 50%;
  transition: all 0.2s;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  line-height: 1;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
}

.modal-content {
  padding: 32px;
}

.level-modal-content {
  h4 {
    margin: 0 0 16px 0;
    color: #1f2937;
    font-size: 1.3rem;
    font-weight: 600;
  }

  p {
    margin: 0 0 16px 0;
    color: #6b7280;
    line-height: 1.6;
    font-size: 1.05rem;

    &:last-child {
      margin-bottom: 0;
    }

    strong {
      color: #1f2937;
    }
  }
}
</style>
