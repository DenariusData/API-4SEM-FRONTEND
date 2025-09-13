<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div>
    <!-- top bar -->
    <!-- side bar? -->
    <div class="app">
      <RouterView :key="$route.fullPath" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app {
}
</style>
