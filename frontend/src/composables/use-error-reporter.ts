import * as Sentry from '@sentry/vue'
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { settings } from '@/settings'
import { useI18n } from './use-i18n'

export type ErrorContext = Record<string, unknown>
type ErrorSeverity = 'warning' | 'error'
type ErrorColor = ErrorSeverity

export function useErrorReporter() {
  const { t } = useI18n()
  const route = useRoute()

  function capture(error: Error, context: ErrorContext = {}): void {
    const errorContext = {
      routeName: route.name,
      routePath: route.path,
      ...context,
    }

    if (settings.sentryEnabled) {
      Sentry.captureException(error, { extra: errorContext })
    }
  }

  function errorDetails(error?: Error, options?: { severity?: ErrorSeverity }) {
    const severity = options?.severity || 'error'
    const color: ErrorColor = severity
    const icon = severity === 'error' ? 'i-lucide-triangle-alert' : 'i-lucide-alert-circle'

    const title = computed(() => error?.message || t('errors.unexpectedError'))
    const description = computed(() =>
      settings.devMode
        ? `🚧 ${error?.cause || t('errors.unknownCause')} 🚧`
        : t('errors.supportNotified'),
    )

    return reactive({ severity, color, icon, title, description })
  }

  return { capture, captureError: capture, errorDetails }
}

export function useErrors() {
  return useErrorReporter()
}
