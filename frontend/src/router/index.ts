import { createRouter, createWebHistory } from 'vue-router'
import Explorer from '@/views/Explorer.vue'

const routes = [
  {
    path: '/',
    name: 'Explorer',
    component: Explorer
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
