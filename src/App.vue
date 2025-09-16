<script setup lang="ts">
import { RouterView } from 'vue-router'
import LoginPopup from './modules/login/components/LoginPopup.vue';
import { ref } from 'vue';

const isPopupVisible = ref(false);

const showLoginPopup = () => {
  isPopupVisible.value = true;
};

const hideLoginPopup = () => {
  isPopupVisible.value = false;
};
</script>

<template>
  <v-app>
    <v-app-bar :elevation="2" class="top-bar" color="primary" dark>
      <v-app-bar-title>Radarius</v-app-bar-title>
      <template v-slot:append>
        <v-btn icon="mdi-account-circle"></v-btn>
        <v-btn icon="mdi-login" @click="showLoginPopup"></v-btn>
      </template>
    </v-app-bar>
    <div class="app">
      <RouterView :key="$route.fullPath" />
    </div>
    <LoginPopup v-if="isPopupVisible" @close="hideLoginPopup" />
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
