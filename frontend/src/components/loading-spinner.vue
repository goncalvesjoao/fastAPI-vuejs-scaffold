<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  loading: boolean
  text?: string
  noText?: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <div v-if="loading" class="flex flex-1 items-center justify-center gap-2 text-dimmed">
    <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" />
    <span v-if="!noText" class="text-sm">{{ text || t('common.loading') }}</span>
  </div>
</template>
