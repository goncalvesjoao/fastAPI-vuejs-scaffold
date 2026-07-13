<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useArticlesStore } from '@/stores'
import { Article } from '@/entities'
import { type FormErrorApi, useFormErrors, useErrorReporter, useI18n } from '@/composables'

const toast = useToast()
const { t } = useI18n(import.meta.url)
const articlesStore = useArticlesStore()
const errorReporter = useErrorReporter()

const props = defineProps<{
  article: Article
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  done: []
}>()

const formRef = ref<FormErrorApi>()
const formState = ref({ title: props.article.title })
const { clearFormErrors, setFormErrors } = useFormErrors(formRef)
const submitError = ref<Error | undefined>(undefined)
const submitting = ref(false)
const cannotSubmit = computed(
  () => props.article.isBusy || submitting.value || submitError.value !== undefined,
)

function closeModal() {
  open.value = false
}

async function handleSubmit() {
  if (cannotSubmit.value) return

  submitting.value = true
  clearFormErrors()
  submitError.value = undefined

  articlesStore
    .updateById(props.article.id, formState.value)
    .then((result) => {
      if (result.ok) {
        closeModal()
        emit('done')

        toast.add({
          title: t('.submitSuccessTitle'),
          icon: 'i-lucide-save-check',
          color: 'success',
        })
      } else {
        setFormErrors(result.fieldErrors)

        toast.add({
          title: t('.submitFailureTitle'),
          description: t('common.formWithErrorsDescription'),
          icon: 'i-lucide-save-off',
          color: 'error',
        })
      }
    })
    .catch((error: unknown) => {
      submitError.value = new Error(t('.submitFailureTitle'), {
        cause: error,
      })

      errorReporter.capture(submitError.value, {
        articleId: props.article.id,
      })
    })
    .finally(() => (submitting.value = false))
}

watch(
  () => props.article,
  (newArticle) => {
    if (!newArticle) return

    formState.value = {
      title: newArticle.title,
    }
  },
  { immediate: true },
)
watch(open, () => {
  clearFormErrors()
  submitError.value = undefined
})
</script>

<template>
  <UModal
    v-model:open="open"
    :title="t('.title')"
    :description="t('.description')"
    :dismissible="!submitting"
  >
    <template #body>
      <ErrorAlert v-if="submitError" :error="submitError" class="mx-auto" />

      <UForm
        v-else
        ref="formRef"
        class="w-full space-y-4"
        :state="formState"
        :disabled="cannotSubmit"
        @submit="handleSubmit"
      >
        <UFormField :label="t('entities.article.fields.title')" name="title">
          <UInput v-model="formState.title" autofocus type="text" class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            @click="closeModal"
            :disabled="submitting"
          >
            {{ t('common.close') }}
          </UButton>

          <UButton type="submit" :disabled="cannotSubmit" :loading="submitting">
            {{ t('.submitLabel') }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
