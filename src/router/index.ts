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
      path: '/dashboards',
      name: 'dashboards',
      component: () => import('@/modules/dashboards/DashboardsView.vue'),
    },
    {
      path: '/indicators',
      name: 'indicators',
      component: () => import('@/modules/indicators/IndicatorsView.vue'),
    },
  ],
})

export default router
