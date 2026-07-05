import { useI18n as originalUseI18n } from 'vue-i18n'
import type { FieldErrorType } from '@/lib'
import { ArticleNatureEnum } from '@/entities'

// Registry to map enum objects to their names for i18n translation
const ENUM_REGISTRY = new Map<Record<string, string>, string>([
  [ArticleNatureEnum, 'ArticleNatureEnum'],
])

export function useI18n() {
  const { locale, t, te, tm } = originalUseI18n()

  function translateFormError(fieldPath: string, fieldError: FieldErrorType): string {
    const fieldName = fieldPath
      .split('.')
      .filter((segment) => !/^\d+$/.test(segment))
      .at(-1)
    const keys = [
      `validation.fields.${fieldName}.${fieldError.type}`,
      fieldName && `validation.fields.${fieldName}.${fieldError.type}`,
      `validation.${fieldError.type}`,
    ].filter((key): key is string => Boolean(key))
    const key = keys.find((candidate) => te(candidate, locale.value))

    return key ? t(key, _asContext(fieldError.context)) : fieldError.message
  }

  function translateEnum(enumObj: Record<string, string>): Record<string, string> {
    const enumName = ENUM_REGISTRY.get(enumObj)

    if (!enumName) {
      throw new Error('Enum not registered in ENUM_REGISTRY')
    }

    return Object.fromEntries(
      Object.entries(enumObj).map(([_key, value]) => [value, t(`enums.${enumName}.${value}`)]),
    )
  }

  return {
    locale,
    te,
    tm,
    t,
    translateFormError,
    translateEnum,
  }
}

function _asContext(context: unknown): Record<string, unknown> {
  if (context && typeof context === 'object' && !Array.isArray(context)) {
    return context as Record<string, unknown>
  }

  return {}
}
