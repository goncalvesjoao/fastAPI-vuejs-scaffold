<script setup lang="ts">
import { computed } from 'vue'
import { en, ja } from '@nuxt/ui/locale'
import { setLocale } from '@/i18n'
import { useI18n } from '@/composables'

const { locale, t } = useI18n(import.meta.url)
const locales = [en, ja]
const selectedLocale = computed({
  get: () => locale.value,
  set: (value: string) => setLocale(value),
})
</script>

<template>
  <UDashboardPanel
    :ui="{
      root: 'relative flex flex-1 m-4 lg:ml-0 rounded-lg ring ring-default bg-default/75 shadow min-w-0 min-h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)]',
      body: 'flex flex-col gap-4 sm:gap-6 flex-1 overflow-y-auto px-4 sm:py-6 py-0 sm:py-0',
    }"
  >
    <template #header>
      <UDashboardNavbar
        :ui="{
          root: 'h-(--ui-header-height) shrink-0 flex items-center justify-between px-4 sm:px-6 gap-1.5 border-b-0 z-30 pointer-events-none absolute top-0 inset-x-0',
          left: 'pointer-events-auto',
          right: 'pointer-events-auto',
        }"
      >
        <template #left>
          <slot name="header-left" />
        </template>

        <template #right>
          <slot name="header-right" />

          <div class="relative inline-flex">
            <ULocaleSelect
              v-model="selectedLocale"
              :locales="locales"
              :aria-label="t('.selectLanguage')"
              color="neutral"
              variant="ghost"
              class="size-8 justify-center p-1.5"
              :ui="{
                leading: 'hidden',
                value: 'hidden',
                trailing: 'hidden',
                content: 'min-w-40',
              }"
            />
            <UIcon
              name="i-lucide-languages"
              class="pointer-events-none absolute inset-0 m-auto size-5 text-default"
            />
          </div>

          <UColorModeButton />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <slot name="body" />
    </template>
  </UDashboardPanel>
</template>
