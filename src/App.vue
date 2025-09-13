<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <v-app>
    <v-app-bar :elevation="2" color="primary" dark>
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
.app {
  margin-top: 64px;
  padding: 24px;
}
</style>
