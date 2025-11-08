import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useRoleStore = defineStore('role', () => {
  const roles = ref<string[]>([])

  function addRole(permission: string) {
    roles.value.push(permission)
  }

  function removeRole(role: string) {
    roles.value = roles.value.filter((p) => p !== role)
  }

  function getRole() {
    return computed(() => roles.value)
  }

  return { roles, addRole, removeRole, getRole }
})
