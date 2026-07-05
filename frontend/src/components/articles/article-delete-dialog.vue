<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useArticlesStore } from '@/stores'
import { Article } from '@/entities'
import { useErrorReporter } from '@/composables'

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

const deleting = ref(false)
const deleteError = ref<Error | undefined>(undefined)
const cannotDelete = computed(
  () => props.article.isBusy || deleting.value || deleteError.value !== undefined,
)

async function handleDelete() {
  if (cannotDelete.value) return

  deleting.value = true

  articlesStore
    .deleteById(props.article.id)
    .then((result) => {
      if (result) {
        toast.add({
          title: t('articles.notifications.deleted'),
          icon: 'i-lucide-trash',
          color: 'success',
        })
      } else {
        toast.add({
          title: t('articles.notifications.notFound'),
          description: t('articles.notifications.probablyDeleted'),
          icon: 'i-lucide-trash',
          color: 'warning',
        })
      }

      open.value = false
      emit('done')
    })
    .catch((error: unknown) => {
      deleteError.value = new Error(t('articles.errors.delete'), {
        cause: error,
      })

      errorReporter.capture(deleteError.value, { articleId: props.article.id })
    })
    .finally(() => (deleting.value = false))
}

watch(open, () => (deleteError.value = undefined))
</script>

<template>
  <DeleteDialog
    v-model:open="open"
    :resource-class-name="t('articles.singular')"
    :resource-name="props.article.title"
    :deleting="deleting"
    :error="deleteError"
    @confirm="handleDelete"
  />
</template>
