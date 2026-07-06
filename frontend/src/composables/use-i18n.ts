import { useI18n as originalUseI18n } from 'vue-i18n'

export function useI18n(filePath?: string) {
  const rootPath = ((filePath ? filePath.split('/src/').pop() : undefined) || '')
    .replace(/\.[^/.?]+.*$/, '')
    .replaceAll('/', '.')
  const { locale, t: originalT, te, tm } = originalUseI18n()

  const t = ((...args: unknown[]) => {
    const [key, ...rest] = args
    const normalizedKey =
      typeof key === 'string' && key.startsWith('.') && rootPath ? `${rootPath}${key}` : key

    return (originalT as (...params: unknown[]) => ReturnType<typeof originalT>)(
      normalizedKey,
      ...rest,
    )
  }) as typeof originalT

  return {
    locale,
    te,
    tm,
    t,
  }
}
