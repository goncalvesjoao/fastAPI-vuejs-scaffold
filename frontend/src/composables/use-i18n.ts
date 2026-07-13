import { useI18n as originalUseI18n } from 'vue-i18n'

export function useI18n(filePath?: string) {
  const rootPath = ((filePath ? filePath.split('/src/').pop() : undefined) || filePath || '')
    .replace(/\.[^/.?]+.*$/, '')
    .replaceAll('/', '.')
  const { locale, t: originalT, te: originalTe, tm } = originalUseI18n()

  function normalizeKey(key: unknown) {
    return typeof key === 'string' && key.startsWith('.') && rootPath ? `${rootPath}${key}` : key
  }

  const t = ((...args: unknown[]) => {
    const [key, ...rest] = args

    return (originalT as (...params: unknown[]) => ReturnType<typeof originalT>)(
      normalizeKey(key),
      ...rest,
    )
  }) as typeof originalT

  const te = ((...args: unknown[]) => {
    const [key, ...rest] = args

    return (originalTe as (...params: unknown[]) => ReturnType<typeof originalTe>)(
      normalizeKey(key),
      ...rest,
    )
  }) as typeof originalTe

  return {
    locale,
    te,
    tm,
    t,
  }
}
