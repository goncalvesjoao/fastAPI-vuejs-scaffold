<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { SelectItem } from '@nuxt/ui'
import { usePostsStore } from '@/stores'
import { PostNatureEnum, type CreatePostInputDtoType } from '@/entities'
import { type FormErrorApi, useApiFormErrors, useErrorReporter } from '@/composables'

const toast = useToast()
const { t } = useI18n()
const router = useRouter()
const postsStore = usePostsStore()
const errorReporter = useErrorReporter()

const creating = ref(false)
const createState = ref<CreatePostInputDtoType>({
  title: '',
  content: '',
  nature: PostNatureEnum.Standard,
})
const createError = ref<Error | undefined>(undefined)
const createFormRef = ref<FormErrorApi>()
const { clearFormErrors, setFormErrors } = useApiFormErrors(createFormRef)

const cannotCreate = computed(() => creating.value || createError.value !== undefined)

async function handleSubmit() {
  creating.value = true
  createError.value = undefined
  clearFormErrors()

  postsStore
    .create(createState.value)
    .then((result) => {
      if (result.ok) {
        router.push({ name: 'post-details', params: { id: result.data.id } })

        toast.add({
          title: t('posts.notifications.created'),
          icon: 'i-lucide-circle-check',
          color: 'success',
        })
      } else {
        setFormErrors(result.fieldErrors)

        toast.add({
          title: t('posts.errors.createForm'),
          description: t('posts.notifications.checkForm'),
          icon: 'i-lucide-circle-x',
          color: 'error',
        })
      }
    })
    .catch((error: unknown) => {
      createError.value = new Error(t('posts.errors.create'), { cause: error })

      errorReporter.capture(createError.value)
    })
    .finally(() => {
      creating.value = false
    })
}

const natureItems = computed<SelectItem[]>(() => [
  { label: t('posts.natures.standard'), value: PostNatureEnum.Standard },
  { label: t('posts.natures.journal'), value: PostNatureEnum.Journal },
  { label: t('posts.natures.scientific'), value: PostNatureEnum.Scientific },
])
</script>

<template>
  <UDashboardPanel class="sm:px-5" :ui="{ body: 'sm:p-0' }">
    <template #header>
      <TopNavbar
        ><h1>{{ t('navigation.newPost') }}</h1></TopNavbar
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
              <USelect v-model="createState.nature" :items="natureItems" class="w-full" />
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
              {{ t('posts.create') }}
            </UButton>
          </template>
        </UForm>
      </div>
    </template>
  </UDashboardPanel>
</template>
