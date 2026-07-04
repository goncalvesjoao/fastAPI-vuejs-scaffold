<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePostsStore } from '@/stores'
import { Post } from '@/entities'
import { useErrorReporter } from '@/composables'

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

const deleting = ref(false)
const deleteError = ref<Error | undefined>(undefined)
const cannotDelete = computed(
  () => props.post.isBusy || deleting.value || deleteError.value !== undefined,
)

async function handleDelete() {
  if (cannotDelete.value) return

  deleting.value = true

  postsStore
    .deleteById(props.post.id)
    .then((result) => {
      if (result) {
        toast.add({
          title: t('posts.notifications.deleted'),
          icon: 'i-lucide-trash',
          color: 'success',
        })
      } else {
        toast.add({
          title: t('posts.notifications.notFound'),
          description: t('posts.notifications.probablyDeleted'),
          icon: 'i-lucide-trash',
          color: 'warning',
        })
      }

      open.value = false
      emit('done')
    })
    .catch((error: unknown) => {
      deleteError.value = new Error(t('posts.errors.delete'), {
        cause: error,
      })

      errorReporter.capture(deleteError.value, { postId: props.post.id })
    })
    .finally(() => (deleting.value = false))
}
</script>

<template>
  <DeleteDialog
    v-model:open="open"
    :resource-class-name="t('posts.singular')"
    :resource-name="props.post.title"
    :deleting="deleting"
    :error="deleteError"
    @confirm="handleDelete"
  />
</template>
