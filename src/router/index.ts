import { createRouter, createWebHistory } from 'vue-router'
import { useAdminStore } from '../stores/admin'

const routes = [
  // ── Public routes ──────────────────────────────────────────────────────────
  {
    path: '/',
    name: 'EventList',
    component: () => import('../views/EventList.vue'),
  },
  {
    path: '/events/:slug',
    name: 'EventDetail',
    component: () => import('../views/EventDetail.vue'),
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('../views/Checkout.vue'),
  },
  {
    path: '/my-tickets',
    name: 'MyTickets',
    component: () => import('../views/MyTickets.vue'),
  },

  // ── Admin routes ───────────────────────────────────────────────────────────
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/admin/AdminLogin.vue'),
  },
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    redirect: '/admin/orders',
    beforeEnter: () => {
      const adminStore = useAdminStore()
      if (!adminStore.isAuthenticated) {
        return { name: 'AdminLogin' }
      }
    },
    children: [
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('../views/admin/AdminOrders.vue'),
      },
      {
        path: 'orders/:orderNumber',
        name: 'AdminOrderDetail',
        component: () => import('../views/admin/AdminOrderDetail.vue'),
      },
      {
        path: 'inventory',
        name: 'AdminInventory',
        component: () => import('../views/admin/AdminInventory.vue'),
      },
    ],
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
