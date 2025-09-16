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
      path: '/criterias',
      name: 'criterias',
      component: () => import('@/modules/criterias/CriteriasView.vue'),
    },
  ],
})

export default router
