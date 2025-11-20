<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoleStore } from '@/modules/login/store/roleStore'
import { UserRole } from '@/modules/users/enum/roles'

defineProps<{
  isLoggedIn: boolean
}>()

const emit = defineEmits<{
  (e: 'login'): void
  (e: 'logout'): void
}>()

const menuOpen = ref(false)
const roleStore = useRoleStore()

const roleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.GESTOR]: 'Gestor',
  [UserRole.AGENTE]: 'Agente',
  [UserRole.PUBLIC]: 'Público',
}

const userData = computed(() => {
  if (!roleStore.token) return null
  
  return {
    email: 'Usuário',
    role: roleStore.role ? roleLabels[roleStore.role] : 'Sem permissão',
  }
})

const handleLogout = () => {
  roleStore.clearAuth()
  menuOpen.value = false
  emit('logout')
}
</script>

<template>
  <div class="user-auth">
    <v-btn v-if="!isLoggedIn" icon="mdi-login" variant="text" color="black" @click="$emit('login')"></v-btn>

    <v-menu v-else v-model="menuOpen" :close-on-content-click="false" location="bottom end">
      <template v-slot:activator="{ props }">
        <v-btn icon="mdi-account-circle" variant="text" color="black" v-bind="props"></v-btn>
      </template>

      <v-card min-width="300" class="user-menu">
        <v-card-text class="pa-4">
          <div class="user-info">
            <v-avatar color="black" size="48">
              <v-icon color="white" size="24">mdi-account</v-icon>
            </v-avatar>

            <div class="user-details">
              <div class="user-email">{{ userData?.email }}</div>
              <v-chip size="small" color="black" variant="tonal" class="user-role">
                {{ userData?.role }}
              </v-chip>
            </div>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-btn color="error" variant="tonal" block prepend-icon="mdi-logout" @click="handleLogout"> Sair </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<style lang="scss" scoped>
.user-menu {
  border-radius: 12px;
  overflow: hidden;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-email {
  font-weight: 500;
  margin-bottom: 4px;
  color: #1f2937;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  text-transform: capitalize;
}
</style>
