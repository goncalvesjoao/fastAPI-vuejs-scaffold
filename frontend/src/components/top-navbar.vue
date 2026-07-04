<script setup lang="ts">
defineProps<{
  noNewButton?: boolean
}>()
</script>

<template>
  <UDashboardNavbar
    class="border-b-0 backdrop-blur lg:backdrop-blur-none pointer-events-none sm:px-0"
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
