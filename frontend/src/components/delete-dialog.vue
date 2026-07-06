<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/composables'

const props = defineProps<{
  resourceClassName: string
  resourceName?: string
  deleting?: boolean
  busy?: boolean
  error?: Error
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  confirm: []
}>()

const { t } = useI18n(import.meta.url)
const cannotDelete = computed(() => props.busy || props.deleting || props.error !== undefined)
const title = computed(() => t('.title', { resource: props.resourceClassName }))
const description = computed(() =>
  props.resourceName
    ? t('.description', { name: props.resourceName })
    : t('.unnamedDescription', { resource: props.resourceClassName }),
)

function closeDialog() {
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" :title="title" :description="description" :dismissible="!deleting">
    <template #body>
      <div class="space-y-4">
        <UnexpectedError v-if="error" :error="error" class="mx-auto" />

        <div v-if="!error" class="flex justify-end gap-2">
          <UButton type="button" color="neutral" variant="ghost" @click="closeDialog">
            {{ t('common.close') }}
          </UButton>
          <UButton
            type="button"
            color="error"
            icon="i-lucide-trash-2"
            :loading="deleting"
            :disabled="cannotDelete"
            @click="emit('confirm')"
          >
            {{ t('common.delete') }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
