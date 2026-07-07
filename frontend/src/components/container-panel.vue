<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    class?: string
    blurHeaderOn?: boolean
  }>(),
  {
    blurHeaderOn: true,
  },
)

const cssClass = computed(() => {
  const baseClass = 'relative flex-1 flex flex-col gap-4 sm:gap-6 pt-0 sm:pt-0 pb-2 sm:pb-3'

  return props.class ? `${baseClass} ${props.class}` : baseClass
})
</script>

<template>
  <UContainer :class="cssClass">
    <div
      v-if="props.blurHeaderOn"
      class="sticky top-0 z-10 backdrop-blur-sm h-(--ui-header-height) -mx-4"
    ></div>

    <slot />
  </UContainer>
</template>
