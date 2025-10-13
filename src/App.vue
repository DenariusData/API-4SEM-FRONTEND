<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import LoginPopup from './modules/login/LoginPopup.vue'
import AutoCompleteMenu from './shared/AutoCompleteMenu.vue'
import NotificationDropdown from './modules/alerts/components/NotificationDropdown.vue'

const menu = ref(false)
const showLogin = ref(false)

const openLogin = () => {
  showLogin.value = true
}
</script>

<template>
  <v-app>
    <v-app-bar :elevation="0" class="top-bar" color="white">
      <div class="logo-container">
        <img src="../radariustxt.svg" alt="Logo" class="logo" />
      </div>

      <AutoCompleteMenu v-model="menu" />

      <v-spacer></v-spacer>

      <div class="actions">
        <NotificationDropdown />
        <v-btn icon="mdi-login" variant="text" color="black" @click="openLogin"></v-btn>
      </div>
    </v-app-bar>

    <div class="app">
      <RouterView :key="$route.fullPath" />
    </div>

    <LoginPopup v-model="showLogin" />
  </v-app>
</template>

<style lang="scss" scoped>
.top-bar {
  border-bottom: 1px solid #e0e0e0;

  :deep(.v-toolbar__content) {
    max-width: 1440px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  height: 48px;
  width: auto;
}

.actions {
  display: flex;
  align-items: center;
  gap: 11px;
}

.app {
  position: relative;
  height: calc(100vh - 65px);
  max-width: 1440px;
  width: 100%;
  margin: 64px auto 0 auto;
  padding: 24px 0px;
}
</style>
