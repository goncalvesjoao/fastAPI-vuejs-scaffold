import HomePage from '@/pages/home-page.vue'
import HealthPage from '@/pages/health-page.vue'
import SignInPage from '@/pages/sign-in-page.vue'
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  { path: '/', component: HomePage, name: 'home' },
  {
    path: '/articles',
    redirect: { name: 'new-article' },
  },
  {
    path: '/articles/new',
    component: () => import('@/pages/articles/new-page.vue'),
    name: 'new-article',
    meta: { requiresAuth: true },
  },
  {
    path: '/articles/:id',
    name: 'article-details',
    meta: { requiresAuth: true },
    redirect: (to) => ({
      name: 'edit-article',
      params: { id: String(to.params.id) },
    }),
  },
  {
    path: '/articles/:id/edit',
    component: () => import('@/pages/articles/edit-page.vue'),
    name: 'edit-article',
    meta: { requiresAuth: true },
  },
  { path: '/health', name: 'health', component: HealthPage },
  { path: '/sign-in', name: 'sign-in', component: SignInPage },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/not-found-page.vue'),
  },
]
