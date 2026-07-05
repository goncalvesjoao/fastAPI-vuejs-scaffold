<script setup lang="ts"></script>

<template>
  <UDashboardPanel class="sm:px-5" :ui="{ body: 'sm:p-0' }">
    <template #header>
      <TopNavbar><h1>Oh no</h1></TopNavbar>
    </template>

    <template #body>
      <div class="flex items-start h-full w-1/2 mx-auto py-6">
        <div class="mx-auto">
          <h1 class="text-4xl font-bold text-center mb-4">404 - Page Not Found</h1>
          <p class="text-center mb-6">
            The page you are looking for does not exist or has been moved.
          </p>
          <div class="text-center">
            <UButton :to="{ name: 'home' }" color="primary">Go Back Home</UButton>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
