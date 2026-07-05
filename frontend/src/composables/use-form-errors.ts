import { watch, shallowRef, type Ref } from 'vue'
import type { FormError } from '@nuxt/ui'
import { useI18n } from '@/composables/use-i18n'
import type { FieldErrorsType } from '@/lib'

export type ApiValidationIssue = {
  name: string
  type: string
  context: Record<string, unknown>
  fallbackMessage: string
}

export type FormErrorApi = {
  clear(): void
  getErrors(): FormError[]
  setErrors(errors: FormError[]): void
}

export function useFormErrors(formRef: Ref<FormErrorApi | null | undefined>) {
  const _fieldErrors = shallowRef<FieldErrorsType>({})
  const { locale, translateFormError } = useI18n()

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

  watch(formRef, applyErrors)
  watch(locale, applyErrors, { flush: 'post' })

  return {
    clearFormErrors,
    setFormErrors,
  }
}
