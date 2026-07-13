<script setup lang="ts">
import { computed } from 'vue'
import { useErrorReporter } from '@/composables'

const { errorDetails } = useErrorReporter()

const props = defineProps<{
  error: Error
  icon?: string
}>()

const details = errorDetails(props.error)

const icon = computed(() => props.icon ?? details.icon)
const iconSize = computed(() => (details.description === '' ? 'size-5' : 'size-11'))
</script>

<template>
  <UAlert :icon="icon" :color="details.color" variant="subtle" :ui="{ icon: iconSize }">
    <template #title> {{ details.title }} </template>
    <template v-if="details.description !== ''" #description> {{ details.description }} </template>
  </UAlert>
</template>
