<script setup lang="ts">
const { page, totalPages } = defineProps<{
  page: number;
  totalPages: number;
}>();

const emit = defineEmits(["go-first", "go-prev", "go-next", "go-last"]);
</script>

<template>
  <div class="pagination">
    <button @click="emit('go-first')" :disabled="page === 0">«</button>
    <button @click="emit('go-prev')" :disabled="page === 0">‹</button>

    <span>Página {{ page + 1 }} de {{ totalPages }}</span>

    <button @click="emit('go-next')" :disabled="page >= totalPages - 1">›</button>
    <button @click="emit('go-last')" :disabled="page >= totalPages - 1">»</button>
  </div>
</template>

<style scoped>
.pagination {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
}

.pagination button {
  border: 1px solid #ccc;
  background: white;
  padding: 6px 10px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
}

.pagination button:hover:not(:disabled) {
  background: #f0f0f0;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: default;
}

.pagination span {
  font-size: 14px;
  margin: 0 6px;
}
</style>
