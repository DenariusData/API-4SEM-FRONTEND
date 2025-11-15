import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/modules/home/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/alerts',
      name: 'alerts',
      component: () => import('@/modules/alerts/AlertsView.vue'),
    },
    {
      path: '/alerts/:id',
      name: 'alert-details',
      component: () => import('@/modules/alerts/AlertDetailsView.vue'),
      props: true,
    },
    {
      path: '/indicators',
      name: 'indicators',
      component: () => import('@/modules/indicators/IndicatorsView.vue'),
    },
     {
      path: '/protocols',
      name: 'protocols',
      component: () => import('@/modules/protocols/ProtocolsView.vue'),
    },
    {
      path: '/persons',
      name: 'persons',
      component: () => import('@/modules/persons/pages/PersonsView.vue'),
    },
  ],
})

export default router
