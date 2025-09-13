import '@/assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
// Icons
import '@mdi/font/css/materialdesignicons.css'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

// Mock
import { makeServer } from '../mirage.config.ts'

import App from '@/App.vue'
import router from '@/router'

const app = createApp(App)

const vuetify = createVuetify({
  components,
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
