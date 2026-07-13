const baseUrl = (import.meta.env.BASE_URL || '').trim()
const clerkPublishableKey = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '').trim()
const noAuth = (import.meta.env.VITE_NO_AUTH || '').toLocaleLowerCase().trim()
const devMode = import.meta.env.DEV && import.meta.env.MODE !== 'production'
const noAuthToken = (import.meta.env.VITE_NO_AUTH_TOKEN || '').trim() || 'current_user'
const sentryDsn = (import.meta.env.VITE_SENTRY_DSN || '').trim()
const sentryEnabled = sentryDsn !== ''
const authBypassed = noAuth === 'true' || (noAuth === '' && clerkPublishableKey === '')
const clerkEnabled = !authBypassed && clerkPublishableKey !== ''

export const settings = Object.freeze({
  baseUrl,
  clerkPublishableKey,
  noAuth,
  devMode,
  sentryEnabled,
  sentryDsn,
  noAuthToken,
  authBypassed,
  clerkEnabled,
})
