<script setup lang="ts">
import { useI18n } from '@/composables'
const { t } = useI18n(import.meta.url)
</script>

<template>
  <UDashboardPanel class="min-h-0 sm:px-3" :ui="{ body: 'sm:p-0' }">
    <template #header>
      <TopNavbar
        ><h1>{{ t('.title') }}</h1></TopNavbar
      >
    </template>

    <template #body>
      <UContainer class="flex-1 flex flex-col gap-4 sm:gap-6 py-4 sm:py-6">
        <div class="mx-auto">
          <h1 class="text-4xl font-bold text-center mb-4">{{ t('.heading') }}</h1>
          <p class="text-center mb-6">
            {{ t('.description') }}
          </p>
          <div class="text-center">
            <UButton :to="{ name: 'home' }" color="primary">{{ t('.goBackHome') }}</UButton>
          </div>
        </div>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
