<script setup lang="ts">
import { useI18n } from '@/composables'
const { t } = useI18n(import.meta.url)
</script>

<template>
  <DashboardPanel>
    <template #body>
      <ErrorPanel icon="i-lucide-monitor-x" :title="t('.title')" :description="t('.description')" />
    </template>
  </DashboardPanel>
</template>
