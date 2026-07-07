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

      <RouterView />
    </UDashboardGroup>
  </UApp>
</template>
