import { createRouter, createWebHistory } from 'vue-router'
import { useRoleStore } from '@/modules/login/store/roleStore'
import HomeView from '@/modules/home/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { public: true },
    },
    {
      path: '/alerts',
      name: 'alerts',
      component: () => import('@/modules/alerts/AlertsView.vue'),
      meta: { requiresAuth: true, requiresAgente: true },
    },
    {
      path: '/alerts/:id',
      name: 'alert-details',
      component: () => import('@/modules/alerts/AlertDetailsView.vue'),
      props: true,
      meta: { requiresAuth: true, requiresAgente: true },
    },
    {
      path: '/dashboards',
      name: 'dashboards',
      component: () => import('@/modules/dashboards/DashboardsView.vue'),
      meta: { requiresAuth: true, requiresGestor: true },
    },
    {
      path: '/indicators',
      name: 'indicators',
      component: () => import('@/modules/indicators/IndicatorsView.vue'),
      meta: { public: true },
    },
    {
      path: '/protocols',
      name: 'protocols',
      component: () => import('@/modules/protocols/ProtocolsView.vue'),
      meta: { requiresAuth: true, requiresGestor: true },
    },
    {
      path: '/persons',
      name: 'persons',
      component: () => import('@/modules/persons/pages/PersonsView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: () => import('@/modules/home/HomeView.vue'),
      meta: { public: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const roleStore = useRoleStore()

  if (to.meta.public) {
    next()
    return
  }

  if (to.meta.requiresAuth && !roleStore.isAuthenticated) {
    next({ name: 'home', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.requiresAdmin && !roleStore.isAdmin) {
    next({ name: 'unauthorized' })
    return
  }

  if (to.meta.requiresGestor && !roleStore.hasGestorAccess) {
    next({ name: 'unauthorized' })
    return
  }

  if (to.meta.requiresAgente && !roleStore.hasAgenteAccess) {
    next({ name: 'unauthorized' })
    return
  }

  next()
})

export default router
