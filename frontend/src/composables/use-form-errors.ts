import { watch, shallowRef, type Ref } from 'vue'
import type { FormError } from '@nuxt/ui'
import { useI18n } from '@/composables/use-i18n'
import type { FieldErrorsType, FieldErrorType } from '@/lib'

export type FormErrorApi = {
  clear(): void
  getErrors(): FormError[]
  setErrors(errors: FormError[]): void
}

export function useFormErrors(formRef: Ref<FormErrorApi | null | undefined>) {
  const _fieldErrors = shallowRef<FieldErrorsType>({})
  const { locale, t, te } = useI18n()

  function applyErrors(): void {
    const messagesByField = new Map<string, string[]>()

    Object.entries(_fieldErrors.value).forEach(([fieldPath, fieldErrors]) => {
      const fieldName = fieldPath.startsWith('body.') ? fieldPath.slice(5) : fieldPath

      fieldErrors.forEach((fieldError) => {
        const message = translateFormError(fieldPath, fieldError)
        const messages = messagesByField.get(fieldName) ?? []
        messages.push(message)
        messagesByField.set(fieldName, messages)
      })
    })

    const formErrors = Array.from(messagesByField, ([name, messages]) => ({
      name,
      message: messages.join(', '),
    }))

    formRef.value?.setErrors(formErrors)
  }

  function setFormErrors(fieldErrors: FieldErrorsType): void {
    _fieldErrors.value = fieldErrors
    applyErrors()
  }

  function clearFormErrors(): void {
    _fieldErrors.value = {}
    formRef.value?.clear()
  }

  function translateFormError(fieldPath: string, fieldError: FieldErrorType): string {
    const localeKey = 'composables.useI18n.translateFormError.validations'

    const fieldName = fieldPath
      .split('.')
      .filter((segment) => !/^\d+$/.test(segment))
      .at(-1)
    const keys = [
      `${localeKey}.fields.${fieldName}.${fieldError.type}`,
      fieldName && `${localeKey}.fields.${fieldName}.${fieldError.type}`,
      `${localeKey}.${fieldError.type}`,
    ].filter((key): key is string => Boolean(key))
    const key = keys.find((candidate) => te(candidate, locale.value))

    return key ? t(key, _asContext(fieldError.context)) : fieldError.message
  }

  watch(formRef, applyErrors)
  watch(locale, applyErrors, { flush: 'post' })

  return {
    clearFormErrors,
    setFormErrors,
    translateFormError,
  }
}

function _asContext(context: unknown): Record<string, unknown> {
  if (context && typeof context === 'object' && !Array.isArray(context)) {
    return context as Record<string, unknown>
  }

  return {}
}
