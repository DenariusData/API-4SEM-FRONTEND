<script setup lang="ts">
import AutoCompleteMenu from './shared/AutoCompleteMenu.vue'
import LoginPopup from './modules/login/LoginPopup.vue'
import NotificationDropdown from './modules/alerts/components/NotificationDropdown.vue'
import sharedServices from '@/shared/services/sharedServices.ts'
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useRoleStore } from '@/modules/login/store/roleStore'
import { parseJwt } from '@/utils/jwt'

const menu = ref(false)
const showLogin = ref(false)
const isLoggedIn = ref(false)
const showRoutineButton = import.meta.env.VITE_SHOW_ROUTINE_BUTTON === 'true'
const { addRole } = useRoleStore()

const checkLoginStatus = () => {
  const token = localStorage.getItem('token')
  if (token) {
    const decodedToken = parseJwt(token)

    if (decodedToken?.r) {
      console.log('User role from token:', decodedToken.r)
      addRole(decodedToken.r)
    }
    isLoggedIn.value = true
  } else {
    isLoggedIn.value = false
  }
}

const openLogin = () => {
  if (!isLoggedIn.value) {
    showLogin.value = true
  }
}

const updateDatabase = async () => {
  await sharedServices.updateDatabase()
}

onMounted(() => {
  checkLoginStatus()
})
</script>

<template>
  <v-app>
    <v-app-bar :elevation="0" class="top-bar" color="white">
      <div class="logo-container">
        <img src="../public/radariustxt.svg" alt="Logo" class="logo" />
      </div>

      <AutoCompleteMenu v-model="menu" />

      <v-spacer></v-spacer>

      <div class="actions">
        <v-btn v-if="showRoutineButton" icon="mdi-refresh" variant="text" color="black" @click="updateDatabase"></v-btn>
        <NotificationDropdown />
        <v-btn v-if="!isLoggedIn" icon="mdi-login" variant="text" color="black" @click="openLogin"></v-btn>
        <v-btn v-else icon="mdi-account-circle" variant="text" color="black"></v-btn>
      </div>
    </v-app-bar>

    <div class="app">
      <RouterView :key="$route.fullPath" />
    </div>

    <LoginPopup v-model="showLogin" @login-success="checkLoginStatus" />
  </v-app>
</template>

<style lang="scss" scoped>
.top-bar {
  border-bottom: 1px solid #e0e0e0;

  :deep(.v-toolbar__content) {
    max-width: 1472px;
    padding: 0 16px;
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
  max-width: 1472px;
  width: 100%;
  margin: 64px auto 0 auto;
  padding: 24px 16px;
}
</style>
