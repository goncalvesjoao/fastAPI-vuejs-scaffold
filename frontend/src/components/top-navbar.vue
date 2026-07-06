<script setup lang="ts">
defineProps<{
  noNewButton?: boolean
}>()
</script>

<template>
  <UDashboardNavbar
    class="top-0 inset-x-0 border-b-0 z-10 pointer-events-none sm:px-4"
    :ui="{ left: 'pointer-events-auto min-w-0', right: 'pointer-events-auto' }"
  >
    <template #left>
      <slot />
    </template>

    <template #right>
      <slot name="extra-buttons" />

      <LanguageSelect />
      <UColorModeButton />
    </template>
  </UDashboardNavbar>
</template>
