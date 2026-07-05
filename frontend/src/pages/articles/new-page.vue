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

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const articlesStore = useArticlesStore()
const errorReporter = useErrorReporter()
const { enumToSelectOptions } = useEnums()

const creating = ref(false)
const createState = ref({
  title: '',
  content: '',
  nature: ArticleNatureEnum.Standard,
})
const createError = ref<Error | undefined>(undefined)
const createFormRef = ref<FormErrorApi>()
const { clearFormErrors, setFormErrors } = useFormErrors(createFormRef)

const cannotCreate = computed(() => creating.value || createError.value !== undefined)

async function handleSubmit() {
  creating.value = true
  createError.value = undefined
  clearFormErrors()

  articlesStore
    .create(createState.value)
    .then((result) => {
      if (result.ok) {
        router.push({ name: 'article-details', params: { id: result.data.id } })

        toast.add({
          title: t('articles.notifications.created'),
          icon: 'i-lucide-circle-check',
          color: 'success',
        })
      } else {
        setFormErrors(result.fieldErrors)

        toast.add({
          title: t('articles.errors.createForm'),
          description: t('articles.notifications.checkForm'),
          icon: 'i-lucide-circle-x',
          color: 'error',
        })
      }
    })
    .catch((error: unknown) => {
      createError.value = new Error(t('articles.errors.create'), { cause: error })

      errorReporter.capture(createError.value)
    })
    .finally(() => {
      creating.value = false
    })
}
</script>

<template>
  <UDashboardPanel class="sm:px-5" :ui="{ body: 'sm:p-0' }">
    <template #header>
      <TopNavbar
        ><h1>{{ t('navigation.newArticle') }}</h1></TopNavbar
      >
    </template>

    <template #body>
      <div class="flex items-start h-full w-1/2 mx-auto py-6">
        <UForm
          ref="createFormRef"
          class="w-full space-y-4"
          :state="createState"
          :disabled="cannotCreate"
          @submit="handleSubmit"
        >
          <UnexpectedError v-if="createError" :error="createError" class="mx-auto" />

          <template v-else>
            <UFormField :label="t('common.title')" name="title">
              <UInput v-model="createState.title" type="text" class="w-full" />
            </UFormField>

            <UFormField :label="t('common.content')" name="content">
              <UTextarea v-model="createState.content" class="w-full" />
            </UFormField>

            <UFormField :label="t('common.nature')" name="nature">
              <USelect
                v-model="createState.nature"
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
              :disabled="cannotCreate"
              :loading="creating"
            >
              {{ t('articles.create') }}
            </UButton>
          </template>
        </UForm>
      </div>
    </template>
  </UDashboardPanel>
</template>
