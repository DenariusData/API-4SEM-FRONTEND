import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useRoleStore = defineStore('role', () => {
  const roles = ref<string[]>([])

  function setRoles(newRoles: string[] | null) {
    roles.value = newRoles || []
  }

  function getRoles() {
    return computed(() => roles.value)
  }

  return { roles, setRoles, getRoles }
})
