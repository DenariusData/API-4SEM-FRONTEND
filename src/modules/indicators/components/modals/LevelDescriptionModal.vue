<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { SelectedLevel } from '@/shared/enums'

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
  emit('update:visible', true)
}

const closeModal = () => {
  isVisible.value = false
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

defineExpose({
  openModal,
})
</script>

<template>
  <v-dialog v-model="isVisible" max-width="500px" persistent>
    <v-card>
      <v-card-title class="modal-header" :style="{ background: levelColor }">
        <h2>Nível {{ props.selectedLevel.value }}</h2>
        <v-btn icon variant="text" @click="closeModal" class="close-btn" aria-label="Fechar modal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="modal-content">
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
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
.modal-header {
  color: white !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;

  h2 {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 600;
    color: white;
  }
}

.close-btn {
  color: white !important;
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
