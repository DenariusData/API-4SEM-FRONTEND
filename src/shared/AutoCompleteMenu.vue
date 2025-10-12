<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

interface MenuItem {
  title: string
  value: string
  route: string
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

const menuItems: MenuItem[] = [
  { title: 'Home', value: 'home', route: 'home' },
  { title: 'Critérios', value: 'criterias', route: 'criterias' },
  { title: 'Alertas', value: 'alerts', route: 'alerts' },
  { title: 'Dashboards', value: 'dashboards', route: 'dashboards' },
  { title: 'Indicadores', value: 'indicators', route: 'indicators' },
]

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
    const item = menuItems.find((item) => item.value === value)
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
