<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <v-app>
    <v-app-bar :elevation="2" class="top-bar" color="primary" dark>
      <v-app-bar-title>Radarius</v-app-bar-title>
      <template v-slot:append>
        <v-btn icon="mdi-account-circle"></v-btn>
        <v-btn icon="mdi-login"></v-btn>
      </template>
    </v-app-bar>
    <div class="app">
      <RouterView :key="$route.fullPath" />
    </div>
  </v-app>
</template>

<style lang="scss" scoped>
.top-bar {
  :deep(.v-toolbar__content) {
    max-width: 1440px;
    width: 100%;
    margin: 0 auto;
  }
}
.app {
  max-width: 1440px;
  width: 100%;
  margin: 64px auto 0 auto;
  padding: 24px;
}
</style>
