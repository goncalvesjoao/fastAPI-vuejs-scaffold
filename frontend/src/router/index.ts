import { watch } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/use-auth'
import { settings } from '@/settings'
import { routes } from '@/router/routes'

const router = createRouter({
  history: createWebHistory(settings.baseUrl),
  routes,
})

router.beforeEach((to) => {
  // Cleaning up the __clerk_handshake query parameter
  if (to.query.__clerk_handshake) {
    const { __clerk_handshake, ...query } = to.query
    router.replace({ path: to.path, query })
    return false
  }

  if (to.meta.requiresAuth !== true) return true

  try {
    const auth = useAuth()

    // Preventing navigation from taking place until the clerk plugin is loaded
    if (!auth.isLoaded.value) {
      const stopWatch = watch(auth.isLoaded, (loaded) => {
        if (loaded) {
          stopWatch()
          router.replace(to.fullPath)
        }
      })

      return false
    }

    if (!auth.isSignedIn.value) {
      return '/sign-in'
    }
  } catch {
    return '/' // HomePage will present an error message if auth is failing
  }

  return true
})

export default router
