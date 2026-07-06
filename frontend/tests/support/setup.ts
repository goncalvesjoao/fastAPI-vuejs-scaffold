import { i18n } from '@/i18n'

/**
 * Configure i18n to throw errors on missing translation keys in tests.
 * This ensures that any component or composable trying to translate a missing key
 * will fail the test, catching translation issues early.
 */

// Store the original t function
const originalT = i18n.global.t.bind(i18n.global)

// Override the t function to check for missing translations
i18n.global.t = function (...args: unknown[]) {
  const result = originalT(...args)

  // If the result is the same as the key (untranslated), throw an error
  // This happens when a translation key is not found
  const key = args[0]
  if (typeof key === 'string' && result === key) {
    throw new Error(`Missing translation key: "${key}"`)
  }

  return result
}
