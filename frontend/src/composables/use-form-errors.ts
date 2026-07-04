import { watch, shallowRef, type Ref } from 'vue'
import type { FormError } from '@nuxt/ui'
import { useI18n } from 'vue-i18n'
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

export function useApiFormErrors(formRef: Ref<FormErrorApi | null | undefined>) {
  const issues = shallowRef<ApiValidationIssue[]>([])
  const { locale, t, te } = useI18n()

  function localize(issue: ApiValidationIssue): string {
    const fieldName = issue.name
      .split('.')
      .filter((segment) => !/^\d+$/.test(segment))
      .at(-1)
    const keys = [
      `validation.fields.${issue.name}.${issue.type}`,
      fieldName && `validation.fields.${fieldName}.${issue.type}`,
      `validation.${issue.type}`,
    ].filter((key): key is string => Boolean(key))
    const key = keys.find((candidate) => te(candidate, locale.value))

    return key ? t(key, issue.context) : issue.fallbackMessage
  }

  function localizedFormErrors(): FormError[] {
    const messagesByField = new Map<string, string[]>()

    for (const issue of issues.value) {
      const messages = messagesByField.get(issue.name) ?? []
      messages.push(localize(issue))
      messagesByField.set(issue.name, messages)
    }

    return Array.from(messagesByField, ([name, messages]) => ({
      name,
      message: messages.join(', '),
    }))
  }

  function applyErrors(): void {
    formRef.value?.setErrors(localizedFormErrors())
  }

  function setFormErrors(fieldErrors: FieldErrorsType): void {
    issues.value = _validationIssues(fieldErrors)
    applyErrors()
  }

  function clearFormErrors(): void {
    issues.value = []
    formRef.value?.clear()
  }

  watch(formRef, applyErrors)
  watch(
    locale,
    () => {
      const visibleFields = new Set(
        formRef.value
          ?.getErrors()
          .map((error) => error.name)
          .filter((name): name is string => Boolean(name)) ?? [],
      )

      issues.value = issues.value.filter((issue) => visibleFields.has(issue.name))
      applyErrors()
    },
    { flush: 'post' },
  )

  return {
    clearFormErrors,
    setFormErrors,
  }
}

function _validationIssues(fieldErrors: FieldErrorsType): ApiValidationIssue[] {
  return Object.entries(fieldErrors).flatMap(([fieldName, errors]) =>
    errors.map((error) => ({
      name: fieldName.startsWith('body.') ? fieldName.slice(5) : fieldName,
      type: error.type,
      context: _asContext(error.context),
      fallbackMessage: error.message,
    })),
  )
}

function _asContext(context: unknown): Record<string, unknown> {
  if (context && typeof context === 'object' && !Array.isArray(context)) {
    return context as Record<string, unknown>
  }

  return {}
}
