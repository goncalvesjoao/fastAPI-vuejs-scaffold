<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useErrorReporter } from '@/composables'
import { apiClient } from '@/lib'

const errorReporter = useErrorReporter()
const { t } = useI18n()
const loading = ref(false)
const loadError = ref<Error | undefined>(undefined)
const apiOk = ref(false)
const dbOk = ref(false)

onMounted(() => {
  loading.value = true

  apiClient
    .health()
    .then((data) => {
      apiOk.value = data.api
      dbOk.value = data.database
    })
    .catch((error: unknown) => {
      loadError.value = new Error(t('health.requestFailed'), { cause: error })

      errorReporter.capture(loadError.value)
    })
    .finally(() => {
      loading.value = false
    })
})

function color(status: boolean) {
  if (loading.value) return 'neutral'

  return status ? 'success' : 'error'
}
</script>

<template>
  <UDashboardPanel class="sm:px-5" :ui="{ body: 'sm:p-0' }">
    <template #header>
      <TopNavbar><h1>{{ t('health.title') }}</h1></TopNavbar>
    </template>

    <template #body>
      <div class="flex items-start h-full w-1/2 mx-auto py-6">
        <UnexpectedError v-if="loadError" :error="loadError" class="mx-auto" />

        <div v-else class="w-fit mx-auto">
          <div>
            <h1 class="text-2xl font-bold tracking-tight">{{ t('health.heading') }}</h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1">
              {{ t('health.description') }}
            </p>
          </div>

          <div class="grid gap-6 sm:grid-cols-2 mt-3">
            <UCard>
              <div class="flex flex-col items-center gap-4">
                <UIcon name="i-lucide-check-circle" :class="`size-16 text-${color(apiOk)}`" />

                <div class="text-center">
                  <UBadge :color="color(apiOk)" variant="subtle" size="lg">
                    {{ loading ? t('health.checking') : apiOk ? t('health.up') : t('health.down') }}
                  </UBadge>
                </div>
              </div>
            </UCard>

            <UCard>
              <div class="flex flex-col items-center gap-4">
                <UIcon name="i-lucide-database" :class="`size-16 text-${color(dbOk)}`" />

                <div class="text-center">
                  <UBadge :color="color(dbOk)" variant="subtle" size="lg">
                    {{ loading ? t('health.checking') : dbOk ? t('health.up') : t('health.down') }}
                  </UBadge>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
