<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/composables'
import { settings } from '@/settings'

const props = defineProps<{
  error: Error
  description?: string
  noIcon?: boolean
  iconSize?: string
}>()

const { t } = useI18n(import.meta.url)
const defaultDescription = computed(() => {
  return settings.devMode
    ? `🚧 ${props.error?.cause || t('errors.unknownCause')} 🚧`
    : t('errors.supportNotified')
})
const description = computed(() => (props.error ? (props.description ?? defaultDescription) : ''))
const icon = computed(() => (props.noIcon ? undefined : 'i-lucide-triangle-alert'))
const iconSize = computed(() => props.iconSize || (description.value === '' ? 'size-5' : 'size-11'))
</script>

<template>
  <div v-if="error">
    <UAlert :icon="icon" color="error" variant="subtle" :ui="{ icon: iconSize }">
      <template #title> {{ error.message }} </template>
      <template v-if="description !== ''" #description> {{ description }} </template>
    </UAlert>
  </div>
</template>
