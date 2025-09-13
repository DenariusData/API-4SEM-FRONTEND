import '@/assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Mock
import { makeServer } from '../mirage.config.ts'

import App from '@/App.vue'
import router from '@/router'

const app = createApp(App)

const vuetify = createVuetify({
  components,
  directives,
})

app.use(createPinia())
app.use(router)
app.use(vuetify)

if (import.meta.env.MODE === 'development' && import.meta.env.VITE_MOCK_ENABLED === 'true') {
  makeServer()
}

app.mount('#app')
