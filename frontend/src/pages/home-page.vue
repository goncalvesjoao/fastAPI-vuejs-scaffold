<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { authBypassed, useAuth, useErrorReporter, useI18n } from '@/composables'

const errorReporter = useErrorReporter()
const { t } = useI18n(import.meta.url)
let auth: ReturnType<typeof useAuth> | null = null
const authStatus = ref('unconfirmed')
const authError = ref<Error | undefined>(undefined)

const primaryAction = computed(() =>
  authStatus.value === 'authenticated'
    ? { label: t('.actions.createNew'), to: { name: 'new-article' } }
    : { label: t('common.signIn'), to: { name: 'sign-in' } },
)

try {
  auth = useAuth()

  if (authBypassed) checkAuthentication()

  if (auth.isLoaded.value) {
    checkAuthentication()
  } else {
    watch(auth.isLoaded, (loaded) => {
      if (loaded) checkAuthentication()
    })
  }
} catch (error: unknown) {
  authError.value = new Error(t('.initializationFailed'), { cause: error })

  errorReporter.capture(authError.value)
}

async function checkAuthentication() {
  if (authBypassed || auth?.isSignedIn.value) {
    authStatus.value = 'authenticated'
  } else {
    authStatus.value = 'unauthenticated'
  }
}
</script>

<template>
  <DashboardPanel>
    <template #header-left>
      <h2 class="font-medium text-default">{{ t('.navbarTitle') }}</h2>
    </template>

    <template #body>
      <ErrorPanel v-if="authError" :error="authError" :noButton="true" />

      <ContainerPanel v-else>
        <div class="w-fit mx-auto flex flex-col flex-1 items-center justify-center gap-12">
          <LoadingSpinner :loading="authStatus === 'unconfirmed'" />

          <section>
            <p class="text-primary text-xs font-semibold tracking-widest">
              {{ t('.eyebrow') }}
            </p>

            <h2
              class="mt-4 tracking-tighter text-4xl sm:text-5xl font-bold text-highlighted text-balance"
            >
              {{ t('.title') }}
            </h2>

            <p class="mt-4 text-lg text-muted text-balance">
              {{
                authStatus === 'authenticated'
                  ? t('.description.authenticated')
                  : t('.description.unauthenticated')
              }}
            </p>

            <UButton
              :to="{ name: 'new-article' }"
              size="xl"
              icon="i-lucide-plus"
              class="mt-4 px-6 justify-center"
            >
              {{ primaryAction.label }}
            </UButton>
          </section>
        </div>
      </ContainerPanel>
    </template>
  </DashboardPanel>
</template>
