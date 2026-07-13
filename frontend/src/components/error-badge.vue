<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { useErrorReporter, useI18n } from '@/composables'

const { t } = useI18n()
const { errorDetails } = useErrorReporter()
const attrs = useAttrs()

const props = defineProps<{
  error: Error
  icon?: string
}>()

const details = errorDetails(props.error)

const icon = computed(() => props.icon ?? details.icon)
</script>

<template>
  <PopOver
    mode="hover"
    enable-touch
    :title="t(`errors.unexpectedError`)"
    :titleClass="`text-${details.color}`"
    :description="details.description"
  >
    <UBadge
      :icon="icon"
      size="md"
      class="cursor-help"
      :color="details.color"
      variant="soft"
      v-bind="attrs"
    >
      {{ details.title }}
    </UBadge>
  </PopOver>
</template>
