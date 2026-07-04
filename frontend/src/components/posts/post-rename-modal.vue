<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePostsStore } from '@/stores'
import { Post } from '@/entities'
import { type FormErrorApi, useApiFormErrors, useErrorReporter } from '@/composables'

const toast = useToast()
const { t } = useI18n()
const postsStore = usePostsStore()
const errorReporter = useErrorReporter()

const props = defineProps<{
  post: Post
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  done: []
}>()

const renameFormRef = ref<FormErrorApi>()
const { clearFormErrors, setFormErrors } = useApiFormErrors(renameFormRef)
const renameError = ref<Error | undefined>(undefined)
const renameState = ref({ title: props.post.title })
const renaming = ref(false)
const cannotRename = computed(
  () => props.post.isBusy || renaming.value || renameError.value !== undefined,
)

function closeRenameModal() {
  open.value = false
}

async function handleRename() {
  if (cannotRename.value) return

  renaming.value = true
  clearFormErrors()
  renameError.value = undefined

  postsStore
    .updateById(props.post.id, renameState.value)
    .then((result) => {
      if (result.ok) {
        closeRenameModal()
        emit('done')

        toast.add({
          title: t('posts.notifications.renamed'),
          icon: 'i-lucide-save-check',
          color: 'success',
        })
      } else {
        setFormErrors(result.fieldErrors)

        toast.add({
          title: t('posts.errors.renameForm'),
          description: t('posts.notifications.checkForm'),
          icon: 'i-lucide-save-off',
          color: 'error',
        })
      }
    })
    .catch((error: unknown) => {
      renameError.value = new Error(t('posts.errors.rename'), {
        cause: error,
      })

      errorReporter.capture(renameError.value, {
        postId: props.post.id,
      })
    })
    .finally(() => (renaming.value = false))
}

watch(
  () => props.post,
  (newPost) => {
    if (!newPost) return

    renameState.value = {
      title: newPost.title,
    }
  },
  { immediate: true },
)
</script>

<template>
  <UModal
    v-model:open="open"
    :title="t('posts.renameTitle')"
    :description="t('posts.renameDescription')"
    :dismissible="renaming"
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
