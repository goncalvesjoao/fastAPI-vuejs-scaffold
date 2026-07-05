import { useI18n } from '@/composables/use-i18n'

export function useEnums() {
  const { translateEnum } = useI18n()

  function enumToSelectOptions(
    enumObj: Record<string, string>,
  ): { value: string; label: string }[] {
    return Object.entries(translateEnum(enumObj)).map(([key, value]) => ({
      value: key,
      label: value,
    }))
  }

  return { enumToSelectOptions }
}
