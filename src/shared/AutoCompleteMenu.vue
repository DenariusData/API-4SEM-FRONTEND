<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRoleAccess } from '@/composables/useRoleAccess'

interface MenuItem {
  title: string
  value: string
  route: string
  requiresAuth?: boolean
  requiresAgente?: boolean
  requiresGestor?: boolean
  requiresAdmin?: boolean
}

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const router = useRouter()
const selectedItem = ref<string | null>(null)
const roleAccess = useRoleAccess()

const allMenuItems: MenuItem[] = [
  { title: 'Home', value: 'home', route: 'home' },
  { title: 'Alertas', value: 'alerts', route: 'alerts', requiresAuth: true, requiresAgente: true },
  { title: 'Indicadores', value: 'indicators', route: 'indicators' },
  { title: 'Protocolos', value: 'protocols', route: 'protocols', requiresAuth: true, requiresGestor: true },
  { title: 'Usuários', value: 'persons', route: 'persons', requiresAuth: true, requiresAdmin: true },
]

const menuItems = computed(() => {
  return allMenuItems.filter((item) => {
    if (item.requiresAdmin) return roleAccess.isAdmin
    if (item.requiresGestor) return roleAccess.hasGestorAccess
    if (item.requiresAgente) return roleAccess.hasAgenteAccess
    return true
  })
})

const menu = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const goTo = (routeName: string) => {
  menu.value = false
  router.push({ name: routeName })
}

const onItemSelected = (value: string | null) => {
  if (value) {
    const item = allMenuItems.find((item) => item.value === value)
    if (item) {
      goTo(item.route)
      selectedItem.value = null
    }
  }
}
</script>

<template>
  <v-autocomplete
    v-model="selectedItem"
    :items="menuItems"
    item-title="title"
    item-value="value"
    hide-details
    variant="outlined"
    density="compact"
    placeholder="Pesquisar páginas..."
    prepend-inner-icon="mdi-magnify"
    class="search-bar"
    clearable
    @update:model-value="onItemSelected"
  />
</template>

<style lang="scss" scoped>
.search-bar {
  max-width: 300px;
}
</style>
