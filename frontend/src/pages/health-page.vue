<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useErrorReporter, useI18n } from '@/composables'
import { apiClient } from '@/lib'

const errorReporter = useErrorReporter()
const { t } = useI18n(import.meta.url)
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
      loadError.value = new Error(t('.loadFailureMessage'), { cause: error })

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
  <DashboardPanel>
    <template #header-left>
      <h2 class="font-medium text-default">{{ t('.navbarTitle') }}</h2>
    </template>

    <template #body>
      <ErrorPanel v-if="loadError" :error="loadError" />

      <ContainerPanel v-else :blurHeaderOn="false">
        <div
          class="w-fit mx-auto flex flex-col flex-1 items-center text-center justify-center gap-2 sm:gap-2"
        >
          <div>
            <h1 class="text-2xl font-bold tracking-tight">{{ t('.title') }}</h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1">
              {{ t('.description') }}
            </p>
          </div>

          <div class="grid gap-6 sm:grid-cols-2 mt-3">
            <UCard>
              <div class="flex flex-col items-center gap-4">
                <UIcon name="i-lucide-check-circle" :class="`size-16 text-${color(apiOk)}`" />

                <div class="text-center">
                  <UBadge :color="color(apiOk)" variant="subtle" size="lg">
                    {{ loading ? t('.loading') : apiOk ? t('.up') : t('.down') }}
                  </UBadge>
                </div>
              </div>
            </UCard>

            <UCard>
              <div class="flex flex-col items-center gap-4">
                <UIcon name="i-lucide-database" :class="`size-16 text-${color(dbOk)}`" />

                <div class="text-center">
                  <UBadge :color="color(dbOk)" variant="subtle" size="lg">
                    {{ loading ? t('.loading') : dbOk ? t('.up') : t('.down') }}
                  </UBadge>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </ContainerPanel>
    </template>
  </DashboardPanel>
</template>
