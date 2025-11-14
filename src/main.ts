import '/assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import { VDateInput } from 'vuetify/labs/VDateInput'
import * as directives from 'vuetify/directives'
import { pt } from 'vuetify/locale'

// Icons
import '@mdi/font/css/materialdesignicons.css'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

// Mock
import { makeServer } from '../mirage.config.ts'

import App from '@/App.vue'
import router from '@/router'
import { startPeriodicUpdates } from '@/shared/periodicUpdater'

const app = createApp(App)

const vuetify = createVuetify({
  components: {
    ...components,
    VDateInput,
  },
  locale: {
    locale: 'pt',
    messages: { pt },
  },
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
})

app.use(createPinia())
app.use(router)
app.use(vuetify)

if (import.meta.env.MODE === 'development' && import.meta.env.VITE_MOCK_ENABLED === 'true') {
  makeServer()
}

app.mount('#app')

startPeriodicUpdates()
