import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { UserRole } from '@/modules/users/enum/roles'

export const useRoleStore = defineStore('role', () => {
  const role = ref<UserRole | null>(loadRoleFromStorage())
  const token = ref<string | null>(loadTokenFromStorage())
  const userName = ref<string | null>(loadUserNameFromStorage())
  const userEmail = ref<string | null>(loadUserEmailFromStorage())

  function loadRoleFromStorage(): UserRole | null {
    const stored = localStorage.getItem('userRole')
    return stored as UserRole | null
  }

  function loadTokenFromStorage(): string | null {
    return localStorage.getItem('token')
  }

  function loadUserNameFromStorage(): string | null {
    return localStorage.getItem('userName')
  }

  function loadUserEmailFromStorage(): string | null {
    return localStorage.getItem('userEmail')
  }

  function setRole(newRole: UserRole) {
    role.value = newRole
    localStorage.setItem('userRole', newRole)
  }

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUserName(name: string) {
    userName.value = name
    localStorage.setItem('userName', name)
  }

  function setUserEmail(email: string) {
    userEmail.value = email
    localStorage.setItem('userEmail', email)
  }

  function clearAuth() {
    role.value = null
    token.value = null
    userName.value = null
    userEmail.value = null
    localStorage.removeItem('userRole')
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
  }

  const isAuthenticated = computed(() => token.value !== null && role.value !== null)
  const isAdmin = computed(() => role.value === UserRole.ADMIN)
  const isGestor = computed(() => role.value === UserRole.GESTOR || role.value === UserRole.ADMIN)
  const isAgente = computed(() => role.value === UserRole.AGENTE || role.value === UserRole.ADMIN)
  const isPublic = computed(() => role.value === null || role.value === UserRole.PUBLIC)
  
  const hasAgenteAccess = computed(() => 
    role.value === UserRole.AGENTE || 
    role.value === UserRole.ADMIN
  )
  
  const hasGestorAccess = computed(() => 
    role.value === UserRole.GESTOR || 
    role.value === UserRole.ADMIN
  )

  return { 
    role, 
    token,
    userName,
    userEmail,
    setRole, 
    setToken,
    setUserName,
    setUserEmail,
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
