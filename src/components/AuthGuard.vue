<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'
import LoginPage from './LoginPage.vue'

const { isAuthenticated, isLoading } = useAuth0()
</script>

<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white rounded-2xl p-12 text-center shadow-xl">
      <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="mt-4 text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
  <LoginPage v-else-if="!isAuthenticated" />
  <slot v-else />
</template>
