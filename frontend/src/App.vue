<script setup lang="ts">
import { computed } from 'vue'
import { en, ja } from '@nuxt/ui/locale'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const nuxtUiLocale = computed(() => (locale.value === 'ja' ? ja : en))
</script>

<template>
  <UApp
    :locale="nuxtUiLocale"
    :toaster="{ position: 'bottom-right' }"
    :tooltip="{ delayDuration: 10000 }"
  >
    <UDashboardGroup unit="rem">
      <LeftNavbar />

      <div
        class="flex-1 flex m-4 lg:ml-0 rounded-lg ring ring-default bg-default/75 shadow min-w-0 overflow-hidden"
      >
        <RouterView />
      </div>
    </UDashboardGroup>
  </UApp>
</template>
