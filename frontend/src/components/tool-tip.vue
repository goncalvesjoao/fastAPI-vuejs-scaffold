<script lang="ts" setup>
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  arrow: { type: [Boolean, Object], default: true },
  delayDuration: { type: Number, default: 100 },
  content: { type: Object, default: () => ({ side: 'top', sideOffset: 0 }) },
})

const attrs = useAttrs()
const tooltipProps = computed(() => ({ ...props, ...attrs }))
</script>

<template>
  <UTooltip v-bind="tooltipProps">
    <slot />
  </UTooltip>
</template>
