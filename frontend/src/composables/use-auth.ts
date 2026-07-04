import { useAuth as useClerkAuth, useUser as useClerkUser } from '@clerk/vue'
import { computed, ref } from 'vue'
import { translate } from '@/i18n'
import { settings } from '@/settings'

export const authBypassed = settings.authBypassed
export const clerkEnabled = settings.clerkEnabled

export function useAuth() {
  if (settings.authBypassed) {
    return {
      isLoaded: ref(true),
      isSignedIn: ref(true),
      userName: computed(() => translate('common.noName')),
    }
  }

  if (!settings.clerkEnabled) {
    throw new Error('Clerk is required but CLERK_PUBLISHABLE_KEY is not configured')
  }

  const auth = useClerkAuth()
  const user = useClerkUser()

  return {
    isLoaded: auth.isLoaded,
    isSignedIn: auth.isSignedIn,
    userName: computed(() => user.user.value?.fullName || translate('common.noName')),
  }
}

export async function getAuthToken(): Promise<string | null | undefined> {
  if (settings.authBypassed) return settings.noAuthToken

  try {
    return await window.Clerk?.session?.getToken()
  } catch {
    return null
  }
}
