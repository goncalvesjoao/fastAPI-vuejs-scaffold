<script setup lang="ts">
import { useI18n } from '@/composables'
import { computed } from 'vue'
import { settings } from '@/settings'

const props = defineProps<{
  error?: Error
  icon?: string
  title?: string
  eyebrow?: string
  description?: string
  noButton?: boolean
}>()

const { t } = useI18n(import.meta.url)

const icon = computed(() => props.icon ?? (props.error ? 'i-lucide-triangle-alert' : undefined))

const errorColor = computed(() => (props.error ? 'error' : 'primary'))

const title = computed(() => props.title ?? t('errors.unexpectedError'))

const eyebrow = computed(
  () =>
    props.eyebrow ?? (props.error ? (props.error?.message ?? t('errors.unknownError')) : undefined),
)

const defaultDescription = computed(() => {
  return settings.devMode
    ? `🚧 ${props.error?.cause || t('errors.unknownCause')} 🚧`
    : t('errors.supportNotified')
})

const description = computed(() =>
  (props.description ?? props.error) ? (props.description ?? defaultDescription) : '',
)
</script>

<template>
  <ContainerPanel
    :blurHeaderOn="false"
    class="relative flex-1 flex flex-col items-center text-center justify-center gap-2 sm:gap-2"
  >
    <div v-if="icon" class="flex items-center justify-center">
      <UIcon :name="icon" :class="`size-10 shrink-0 text-${errorColor}`" />
    </div>

    <p v-if="eyebrow" :class="`text-base font-semibold text-${errorColor}`">{{ eyebrow }}</p>

    <h1 v-if="title" class="text-4xl sm:text-5xl font-bold text-highlighted text-balance">
      {{ title }}
    </h1>

    <p v-if="description" class="mt-2 text-lg text-muted text-balance">{{ description }}</p>

    <div v-if="props.noButton !== true" class="mt-6 flex items-center justify-center gap-6">
      <UButton v-if="!$slots.default" :to="{ name: 'home' }" color="primary">{{
        t('common.goBackHome')
      }}</UButton>
      <slot v-else />
    </div>
  </ContainerPanel>
</template>
