<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useArticlesStore } from '@/stores'
import { Article } from '@/entities'
import { useErrorReporter, useI18n } from '@/composables'

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
          title: t('.submitSuccessTitle'),
          icon: 'i-lucide-trash',
          color: 'success',
        })
      } else {
        toast.add({
          title: t('.submitWarningMessage'),
          description: t('.submitWarningDescription'),
          icon: 'i-lucide-trash',
          color: 'warning',
        })
      }

      open.value = false
      emit('done')
    })
    .catch((error: unknown) => {
      deleteError.value = new Error(t('.submitFailureTitle'), { cause: error })

      errorReporter.capture(deleteError.value, { articleId: props.article.id })
    })
    .finally(() => (deleting.value = false))
}

watch(open, () => (deleteError.value = undefined))
</script>

<template>
  <DeleteDialog
    v-model:open="open"
    :resource-class-name="t('entities.article.name.singular')"
    :resource-name="props.article.title"
    :deleting="deleting"
    :error="deleteError"
    @confirm="handleDelete"
  />
</template>
