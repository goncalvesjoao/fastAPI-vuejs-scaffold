<script setup lang="ts">
import { SignIn } from '@clerk/vue'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { authBypassed, useAuth, useI18n } from '@/composables'

const router = useRouter()
const { t } = useI18n(import.meta.url)

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
  <UDashboardPanel class="min-h-0 sm:px-3" :ui="{ body: 'sm:p-0' }">
    <template #header>
      <TopNavbar
        ><h1>{{ t('.title') }}</h1></TopNavbar
      >
    </template>

    <template #body>
      <UContainer class="flex-1 flex flex-col gap-4 sm:gap-6 py-4 sm:py-6">
        <LoadingSpinner :loading="loading" />

        <div v-if="!loading" class="w-fit mx-auto">
          <SignIn />
        </div>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
