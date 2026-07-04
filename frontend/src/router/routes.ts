import HomePage from '@/pages/home-page.vue'
import HealthPage from '@/pages/health-page.vue'
import SignInPage from '@/pages/sign-in-page.vue'
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  { path: '/', component: HomePage, name: 'home' },
  {
    path: '/posts',
    redirect: { name: 'new-post' },
  },
  {
    path: '/posts/new',
    component: () => import('@/pages/posts/new-page.vue'),
    name: 'new-post',
    meta: { requiresAuth: true },
  },
  {
    path: '/posts/:id',
    name: 'post-details',
    meta: { requiresAuth: true },
    redirect: (to) => ({
      name: 'edit-post',
      params: { id: String(to.params.id) },
    }),
  },
  {
    path: '/posts/:id/edit',
    component: () => import('@/pages/posts/edit-page.vue'),
    name: 'edit-post',
    meta: { requiresAuth: true },
  },
  { path: '/health', name: 'health', component: HealthPage },
  { path: '/sign-in', name: 'sign-in', component: SignInPage },
]
