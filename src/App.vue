<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterView } from 'vue-router'
import LoginPopup from "./modules/Login/LoginPopup.vue";


const menu = ref(false)
const showLogin = ref(false)
const router = useRouter()

const goToCriterias = () => {
  menu.value = false
  router.push({ name: 'criterias' })
}

const openLogin = () => {
  showLogin.value = true
}
</script>

<template>
  <v-app>
    <v-app-bar :elevation="0" class="top-bar" color="white">
      <!-- Logo -->
      <div class="logo-container">
        <img src="../public/radariustxt.svg" alt="Logo" class="logo" />
      </div>

      <!-- Barra de pesquisa / menu -->
      <v-menu v-model="menu" offset-y transition="fade-transition">
        <template v-slot:activator="{ props }">
          <v-text-field
            v-bind="props"
            readonly
            hide-details
            variant="outlined"
            density="compact"
            placeholder="Menu"
            prepend-inner-icon="mdi-magnify"
            class="search-bar"
            @click="menu = true"
          />
        </template>

        <v-list>
          <v-list-item title="Critérios" @click="goToCriterias" />
        </v-list>
      </v-menu>

      <v-spacer></v-spacer>

      <!-- Ícones à direita -->
      <div class="actions">
        <v-btn icon="mdi-account-circle" variant="text" color="black"></v-btn>
        <v-btn icon="mdi-login" variant="text" color="black" @click="openLogin"></v-btn>
      </div>
    </v-app-bar>

    <div class="app">
      <RouterView :key="$route.fullPath" />
    </div>

    <!-- Componente de Login -->
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
  height: 60px;
  width: auto;
}

.search-bar {
  max-width: 300px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 11px;
}

.app {
  max-width: 1440px;
  width: 100%;
  margin: 64px auto 0 auto;
  padding: 24px;
}
</style>
