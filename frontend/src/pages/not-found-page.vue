<script setup lang="ts">
import { useI18n } from '@/composables'
const { t } = useI18n(import.meta.url)
</script>

<template>
  <UDashboardPanel class="sm:px-5" :ui="{ body: 'sm:p-0' }">
    <template #header>
      <TopNavbar
        ><h1>{{ t('.title') }}</h1></TopNavbar
      >
    </template>

    <template #body>
      <div class="flex items-start h-full w-1/2 mx-auto py-6">
        <div class="mx-auto">
          <h1 class="text-4xl font-bold text-center mb-4">{{ t('.heading') }}</h1>
          <p class="text-center mb-6">
            {{ t('.description') }}
          </p>
          <div class="text-center">
            <UButton :to="{ name: 'home' }" color="primary">{{ t('.goBackHome') }}</UButton>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
