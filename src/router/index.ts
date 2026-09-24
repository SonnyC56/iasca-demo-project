import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: DashboardView },
    { path: '/contacts', name: 'contacts', component: () => import('../views/ContactsView.vue') },
    {
      path: '/companies',
      name: 'companies',
      component: () => import('../views/CompaniesView.vue'),
    },
    { path: '/deals', name: 'deals', component: () => import('../views/DealsView.vue') },
    { path: '/status', name: 'status', component: () => import('../views/HomeView.vue') },
  ],
})

export default router
