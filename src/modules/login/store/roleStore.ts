import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { UserRole } from '@/modules/users/enum/roles'

export const useRoleStore = defineStore('role', () => {
  const role = ref<UserRole | null>(loadRoleFromStorage())
  const token = ref<string | null>(loadTokenFromStorage())

  function loadRoleFromStorage(): UserRole | null {
    const stored = localStorage.getItem('userRole')
    return stored as UserRole | null
  }

  function loadTokenFromStorage(): string | null {
    return localStorage.getItem('token')
  }

  function setRole(newRole: UserRole) {
    role.value = newRole
    localStorage.setItem('userRole', newRole)
  }

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function clearAuth() {
    role.value = null
    token.value = null
    localStorage.removeItem('userRole')
    localStorage.removeItem('token')
  }

  const isAuthenticated = computed(() => token.value !== null && role.value !== null)
  const isAdmin = computed(() => role.value === UserRole.ADMIN)
  const isGestor = computed(() => role.value === UserRole.GESTOR || role.value === UserRole.ADMIN)
  const isAgente = computed(() => role.value === UserRole.AGENTE)
  const isPublic = computed(() => role.value === null || role.value === UserRole.PUBLIC)
  
  const hasAgenteAccess = computed(() => 
    role.value === UserRole.AGENTE || 
    role.value === UserRole.GESTOR || 
    role.value === UserRole.ADMIN
  )
  
  const hasGestorAccess = computed(() => 
    role.value === UserRole.GESTOR || 
    role.value === UserRole.ADMIN
  )

  return { 
    role, 
    token,
    setRole, 
    setToken,
    clearAuth,
    isAuthenticated,
    isAdmin,
    isGestor,
    isAgente,
    isPublic,
    hasAgenteAccess,
    hasGestorAccess
  }
})
