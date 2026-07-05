<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useArticlesStore } from '@/stores'
import { Article } from '@/entities'
import { type FormErrorApi, useFormErrors, useErrorReporter } from '@/composables'

const toast = useToast()
const { t } = useI18n()
const articlesStore = useArticlesStore()
const errorReporter = useErrorReporter()

const props = defineProps<{
  article: Article
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  done: []
}>()

const renameFormRef = ref<FormErrorApi>()
const { clearFormErrors, setFormErrors } = useFormErrors(renameFormRef)
const renameError = ref<Error | undefined>(undefined)
const renameState = ref({ title: props.article.title })
const renaming = ref(false)
const cannotRename = computed(
  () => props.article.isBusy || renaming.value || renameError.value !== undefined,
)

function closeRenameModal() {
  open.value = false
}

async function handleRename() {
  if (cannotRename.value) return

  renaming.value = true
  clearFormErrors()
  renameError.value = undefined

  articlesStore
    .updateById(props.article.id, renameState.value)
    .then((result) => {
      if (result.ok) {
        closeRenameModal()
        emit('done')

        toast.add({
          title: t('articles.notifications.renamed'),
          icon: 'i-lucide-save-check',
          color: 'success',
        })
      } else {
        setFormErrors(result.fieldErrors)

        toast.add({
          title: t('articles.errors.renameForm'),
          description: t('articles.notifications.checkForm'),
          icon: 'i-lucide-save-off',
          color: 'error',
        })
      }
    })
    .catch((error: unknown) => {
      renameError.value = new Error(t('articles.errors.rename'), {
        cause: error,
      })

      errorReporter.capture(renameError.value, {
        articleId: props.article.id,
      })
    })
    .finally(() => (renaming.value = false))
}

watch(
  () => props.article,
  (newArticle) => {
    if (!newArticle) return

    renameState.value = {
      title: newArticle.title,
    }
  },
  { immediate: true },
)
watch(open, () => {
  clearFormErrors()
  renameError.value = undefined
})
</script>

<template>
  <UModal
    v-model:open="open"
    :title="t('articles.renameTitle')"
    :description="t('articles.renameDescription')"
    :dismissible="!renaming"
  >
    <template #body>
      <UnexpectedError v-if="renameError" :error="renameError" class="mx-auto" />

      <UForm
        v-else
        ref="renameFormRef"
        class="w-full space-y-4"
        :state="renameState"
        :disabled="cannotRename"
        @submit="handleRename"
      >
        <UFormField :label="t('common.title')" name="title">
          <UInput v-model="renameState.title" autofocus type="text" class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            @click="closeRenameModal"
            :disabled="renaming"
          >
            {{ t('common.close') }}
          </UButton>

          <UButton type="submit" :disabled="cannotRename" :loading="renaming">
            {{ t('common.save') }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
