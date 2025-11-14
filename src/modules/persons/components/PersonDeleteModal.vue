<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  modelValue: boolean;   
  userId: number | null; 
}>();

const emit = defineEmits(["update:modelValue", "confirm"]);

const dialog = ref(props.modelValue);

watch(
  () => props.modelValue,
  (value) => {
    dialog.value = value;
  }
);

function close() {
  emit("update:modelValue", false);
}

function confirmDelete() {
  if (props.userId !== null) {
    emit("confirm", props.userId); 
  }
  close();
}
</script>

<template>
  <v-dialog v-model="dialog" max-width="400px">
    <v-card>
      <v-card-title class="text-h6">Confirmar Exclusão</v-card-title>

      <v-card-text>
        Tem certeza que deseja excluir este usuário?
        <br />
        Esta ação não pode ser desfeita.
      </v-card-text>

      <v-card-actions>
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn color="red" @click="confirmDelete">Excluir</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>
