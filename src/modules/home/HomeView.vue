<template>
  <p>{{ test }}</p>
  <RouterLink to="/criterias">Critérios</RouterLink>
</template>

<script lang="ts" setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'

const test = ref([])
</script>
