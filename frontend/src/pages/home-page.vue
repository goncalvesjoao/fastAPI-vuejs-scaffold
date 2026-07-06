<script setup lang="ts">
import { ref, watch } from 'vue'
import { authBypassed, useAuth, useErrorReporter, useI18n } from '@/composables'

if (authBypassed) checkAuthentication()

const errorReporter = useErrorReporter()
const { t } = useI18n(import.meta.url)
let auth: ReturnType<typeof useAuth> | null = null
const authStatus = ref('unconfirmed')
const authError = ref<Error | undefined>(undefined)

try {
  auth = useAuth()

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
  <UDashboardPanel class="sm:px-5" :ui="{ body: 'sm:p-0' }">
    <template #header>
      <TopNavbar
        ><h1>{{ t('.title') }}</h1></TopNavbar
      >
    </template>

    <template #body>
      <div class="flex items-start h-full w-1/2 mx-auto py-6">
        <UnexpectedError v-if="authError" :error="authError" class="mx-auto" />

        <div v-else class="mx-auto">
          <LoadingSpinner :loading="authStatus === 'unconfirmed'" />

          <i18n-t
            v-if="authStatus === 'unauthenticated'"
            keypath="pages.home-page.signInPrompt"
            tag="section"
          >
            <template #action>
              <UButton :to="{ name: 'sign-in' }">{{ t('common.signIn') }}</UButton>
            </template>
          </i18n-t>

          <i18n-t
            v-else-if="authStatus === 'authenticated'"
            keypath="pages.home-page.authenticatedPrompt"
            tag="section"
          >
            <template #action>
              <UButton :to="{ name: 'new-article' }">{{
                t('pages.articles.new-page.submitLabel')
              }}</UButton>
            </template>
          </i18n-t>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
