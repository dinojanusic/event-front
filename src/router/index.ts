import { createRouter, createWebHistory } from 'vue-router'

const routes = [
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
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
