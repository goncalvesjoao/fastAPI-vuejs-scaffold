import { useRoute } from 'vue-router'

export type ErrorContext = Record<string, unknown>

export function useErrorReporter() {
  const route = useRoute()

  function capture(_error: Error, context: ErrorContext = {}): void {
    const _context = {
      routeName: route.name,
      routePath: route.path,
      ...context,
    }

    // TODO: Call Sentry or another error-reporting service with _error and _context.
  }

  return { capture }
}
