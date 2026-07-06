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
  <div class="relative inline-flex">
    <ULocaleSelect
      v-model="selectedLocale"
      :locales="locales"
      :aria-label="t('.select')"
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
</template>
