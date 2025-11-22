<script setup lang="ts">
import AutoCompleteMenu from './shared/AutoCompleteMenu.vue'
import LoginPopup from './modules/login/LoginPopup.vue'
import NotificationDropdown from './modules/alerts/components/NotificationDropdown.vue'
import UserAuth from './modules/login/components/UserAuth.vue'
import sharedServices from '@/shared/services/sharedServices.ts'
import { ref, onMounted, computed, watch } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'
import { useRoleStore } from '@/modules/login/store/roleStore'

const menu = ref(false)
const showLogin = ref(false)
const roleStore = useRoleStore()
const router = useRouter()
const route = useRoute()
const showRoutineButton = import.meta.env.VITE_SHOW_ROUTINE_BUTTON === 'true'

const isLoggedIn = computed(() => roleStore.isAuthenticated)

// Monitorar mudanças na autenticação para redirecionamento
watch(isLoggedIn, (newIsLoggedIn, oldIsLoggedIn) => {
  // Se usuário deslogou (estava logado e agora não está mais)
  if (oldIsLoggedIn && !newIsLoggedIn) {
    // Verificar se a rota atual requer autenticação
    const currentRoute = route.meta
    if (currentRoute?.requiresAuth || currentRoute?.requiresAdmin || currentRoute?.requiresGestor || currentRoute?.requiresAgente) {
      // Redirecionar para home se estiver em uma rota protegida
      router.push({ name: 'home' })
    }
  }
})

const checkLoginStatus = () => {
  roleStore.role
}

const handleLogout = () => {
  checkLoginStatus()
  // Verificar se a rota atual requer autenticação e redirecionar se necessário
  const currentRoute = route.meta
  if (currentRoute?.requiresAuth || currentRoute?.requiresAdmin || currentRoute?.requiresGestor || currentRoute?.requiresAgente) {
    router.push({ name: 'home' })
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

      <AutoCompleteMenu v-model="menu" :key="`menu-${roleStore.role}-${roleStore.token ? 'logged' : 'guest'}`" />

      <v-spacer></v-spacer>

      <div class="actions">
        <v-btn v-if="showRoutineButton" icon="mdi-refresh" variant="text" color="black" @click="updateDatabase"></v-btn>
        <NotificationDropdown />
        <UserAuth :is-logged-in="isLoggedIn" @login="openLogin" @logout="handleLogout" />
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
  max-width: 1472px;
  width: 100%;
  margin: 64px auto 0 auto;
  padding: 24px 16px 32px 16px;
  overflow-y: auto;
}
</style>
