<script setup lang="ts">
import { computed } from 'vue'
import { UserButton } from '@clerk/vue'
import { clerkEnabled, useAuth, useI18n } from '@/composables'

defineProps<{
  collapsed: boolean
}>()

let auth: ReturnType<typeof useAuth> | null = null
try {
  auth = useAuth()
} catch {}

const isLoaded = computed(() => auth?.isLoaded.value ?? true)
const isSignedIn = computed(() => auth?.isSignedIn.value ?? false)
const userName = computed(() => auth?.userName.value ?? '')
const { t } = useI18n(import.meta.url)
</script>

<template>
  <template v-if="clerkEnabled && isLoaded">
    <template v-if="isSignedIn">
      <div class="flex items-center px-1" :class="collapsed ? 'justify-center' : 'gap-2'">
        <UserButton />
        <span v-if="!collapsed" class="text-sm text-dimmed truncate">
          {{ userName }}
        </span>
      </div>
    </template>
    <template v-else>
      <UButton
        to="/sign-in"
        color="neutral"
        variant="ghost"
        icon="i-lucide-log-in"
        class="w-full px-1.5"
      >
        {{ collapsed ? undefined : t('common.signIn') }}
      </UButton>
    </template>
  </template>
  <div
    v-else-if="clerkEnabled"
    class="flex items-center gap-2"
    :class="collapsed ? 'justify-center' : ''"
  >
    <USkeleton class="size-8 rounded-full shrink-0" />
    <USkeleton v-if="!collapsed" class="h-4 w-24" />
  </div>
</template>
