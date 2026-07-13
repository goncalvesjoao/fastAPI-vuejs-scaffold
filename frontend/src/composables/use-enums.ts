import { useI18n } from '@/composables/use-i18n'

import { ArticleNatureEnum } from '@/entities'

// Registry to map enum objects to their names for i18n translation
const ENUM_REGISTRY = new Map<Record<string, string>, string>([
  [ArticleNatureEnum, 'entities.article-nature-enum'],
])

export function useEnums() {
  const { t } = useI18n()

  function enumToSelectOptions(
    enumObj: Record<string, string>,
  ): { value: string; label: string }[] {
    return Object.entries(translateEnum(enumObj)).map(([key, value]) => ({
      value: key,
      label: value,
    }))
  }

  function translateEnum(enumObj: Record<string, string>): Record<string, string> {
    const enumPath = ENUM_REGISTRY.get(enumObj)

    if (!enumPath) {
      throw new Error('Enum not registered in ENUM_REGISTRY')
    }

    return Object.fromEntries(
      Object.entries(enumObj).map(([_key, value]) => [value, t(`${enumPath}.${value}`)]),
    )
  }

  return { enumToSelectOptions, translateEnum }
}
