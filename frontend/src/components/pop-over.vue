<script lang="ts" setup>
import { computed, ref, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  dismissible: { type: Boolean, default: true },
  arrow: { type: [Boolean, Object], default: true },
  delayDuration: { type: Number, default: 200 },
  content: { type: Object, default: () => ({ side: 'top', sideOffset: 0 }) },
  title: { type: String, default: '' },
  titleClass: { type: String, default: 'text-gray-700 dark:text-gray-300' },
  description: { type: String, default: '' },
})

const attrs = useAttrs()
const dismissed = ref(false)
const popoverContentPropNames = new Set(['title', 'titleClass', 'description'])
const mergedProps = computed(() => {
  const otherProps = Object.fromEntries(
    Object.entries(props).filter(([key]) => !popoverContentPropNames.has(key)),
  )

  return { ...otherProps, ...attrs }
})

function handleClose() {
  dismissed.value = true
}
</script>

<template>
  <UPopover v-bind="mergedProps" :ui="{ content: 'z-50' }">
    <slot />

    <template v-if="!dismissed" #content>
      <div class="max-w-96 p-2 flex flex-col gap-1">
        <slot v-if="$slots.content" name="content" />

        <template v-else-if="props.title || props.description">
          <div v-if="props.title" class="flex justify-between items-center gap-2">
            <h3 :class="`text-sm font-semibold ${props.titleClass}`">
              {{ props.title }}
            </h3>

            <UButton
              v-if="!props.dismissible"
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              @click="handleClose"
            />
          </div>

          <p class="text-sm text-gray-600 dark:text-gray-400">{{ props.description }}</p>
        </template>
      </div>
    </template>
  </UPopover>
</template>
