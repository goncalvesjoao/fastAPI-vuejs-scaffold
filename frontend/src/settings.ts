const baseUrl = (import.meta.env.BASE_URL || '').trim()
const clerkPublishableKey = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '').trim()
const noAuth = (import.meta.env.VITE_NO_AUTH || '').toLocaleLowerCase().trim()
const devMode = import.meta.env.DEV
const noAuthToken = (import.meta.env.VITE_NO_AUTH_TOKEN || '').trim() || 'current_user'
const authBypassed = noAuth === 'true' || (noAuth === '' && clerkPublishableKey === '')
const clerkEnabled = !authBypassed && clerkPublishableKey !== ''

export const settings = Object.freeze({
  baseUrl,
  clerkPublishableKey,
  noAuth,
  devMode,
  noAuthToken,
  authBypassed,
  clerkEnabled,
})
