<script setup lang="ts">
import { SignIn } from '@clerk/vue'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { authBypassed, useAuth } from '@/composables/use-auth'

const router = useRouter()
const { t } = useI18n()

if (authBypassed) router.push({ name: 'home' })

const loading = ref(true)
let auth: ReturnType<typeof useAuth> | null = null

try {
  auth = useAuth()

  if (auth.isLoaded.value) {
    checkAuthentication()
  } else {
    watch(auth.isLoaded, (loaded) => {
      if (loaded) checkAuthentication()
    })
  }
} catch {
  router.push({ name: 'home' }) // HomePage will present an error message if auth is failing
}

function checkAuthentication() {
  if (auth?.isSignedIn.value) {
    router.push({ name: 'home' })
  } else {
    loading.value = false
  }
}
</script>

<template>
  <UDashboardPanel class="sm:px-5" :ui="{ body: 'sm:p-0' }">
    <template #header>
      <TopNavbar><h1>{{ t('auth.signIn') }}</h1></TopNavbar>
    </template>

    <template #body>
      <div class="flex items-start h-full w-1/2 mx-auto py-6">
        <LoadingSpinner :loading="loading" />

        <div v-if="!loading" class="w-fit mx-auto">
          <SignIn />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
