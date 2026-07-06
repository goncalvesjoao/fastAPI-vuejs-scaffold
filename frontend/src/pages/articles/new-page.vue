<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useArticlesStore } from '@/stores'
import { ArticleNatureEnum } from '@/entities'
import {
  type FormErrorApi,
  useFormErrors,
  useErrorReporter,
  useI18n,
  useEnums,
} from '@/composables'

const { t } = useI18n(import.meta.url)
const toast = useToast()
const router = useRouter()
const articlesStore = useArticlesStore()
const errorReporter = useErrorReporter()
const { enumToSelectOptions } = useEnums()

const submitting = ref(false)
const formState = ref({
  title: '',
  content: '',
  nature: ArticleNatureEnum.Standard,
})
const submitError = ref<Error | undefined>(undefined)
const createFormRef = ref<FormErrorApi>()
const { clearFormErrors, setFormErrors } = useFormErrors(createFormRef)

const cannotSubmit = computed(() => submitting.value || submitError.value !== undefined)

async function handleSubmit() {
  submitting.value = true
  submitError.value = undefined
  clearFormErrors()

  articlesStore
    .create(formState.value)
    .then((result) => {
      if (result.ok) {
        router.push({ name: 'edit-article', params: { id: result.data.id } })

        toast.add({
          title: t('.submitSuccessTitle'),
          icon: 'i-lucide-circle-check',
          color: 'success',
        })
      } else {
        setFormErrors(result.fieldErrors)

        toast.add({
          title: t('.submitFailureTitle'),
          description: t('common.formWithErrorsDescription'),
          icon: 'i-lucide-circle-x',
          color: 'error',
        })
      }
    })
    .catch((error: unknown) => {
      submitError.value = new Error(t('.submitFailureTitle'), { cause: error })

      errorReporter.capture(submitError.value)
    })
    .finally(() => {
      submitting.value = false
    })
}
</script>

<template>
  <UDashboardPanel class="min-h-0 sm:px-3" :ui="{ body: 'sm:p-0' }">
    <template #header>
      <TopNavbar
        ><h1>{{ t('.submitLabel') }}</h1></TopNavbar
      >
    </template>

    <template #body>
      <UContainer class="flex-1 flex flex-col gap-4 sm:gap-6 py-4 sm:py-6">
        <UForm
          ref="createFormRef"
          class="w-full space-y-4"
          :state="formState"
          :disabled="cannotSubmit"
          @submit="handleSubmit"
        >
          <UnexpectedError v-if="submitError" :error="submitError" class="mx-auto" />

          <template v-else>
            <UFormField :label="t('entities.article.fields.title')" name="title">
              <UInput v-model="formState.title" type="text" class="w-full" />
            </UFormField>

            <UFormField :label="t('entities.article.fields.content')" name="content">
              <UTextarea v-model="formState.content" class="w-full" />
            </UFormField>

            <UFormField :label="t('entities.article.fields.nature')" name="nature">
              <USelect
                v-model="formState.nature"
                :items="enumToSelectOptions(ArticleNatureEnum)"
                class="w-full"
              />
            </UFormField>

            <UButton
              block
              class="justify-center w-full mt-4"
              color="primary"
              size="xl"
              icon="i-lucide-circle-plus"
              type="submit"
              :disabled="cannotSubmit"
              :loading="submitting"
            >
              {{ t('.submitLabel') }}
            </UButton>
          </template>
        </UForm>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
