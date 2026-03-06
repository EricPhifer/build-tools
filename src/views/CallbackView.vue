<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'

const router = useRouter()
const { isAuthenticated, isLoading } = useAuth0()

onMounted(() => {
  const checkAuth = setInterval(() => {
    if (!isLoading.value) {
      clearInterval(checkAuth)
      if (isAuthenticated.value) {
        router.replace('/site')
      } else {
        router.replace('/')
      }
    }
  }, 100)
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center" :style="{ backgroundColor: 'var(--theme-bg-secondary)' }">
    <div class="p-12 rounded-2xl text-center shadow-xl" :style="{ backgroundColor: 'var(--theme-bg-card)' }">
      <div class="w-12 h-12 border-4 rounded-full animate-spin mx-auto" :style="{ borderColor: 'var(--theme-primary)', borderTopColor: 'transparent' }"></div>
      <p class="mt-4 font-medium" :style="{ color: 'var(--theme-text-secondary)' }">Processing authentication...</p>
    </div>
  </div>
</template>
