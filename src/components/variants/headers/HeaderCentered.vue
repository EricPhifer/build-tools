<script setup lang="ts">
import { ref } from 'vue'
import AuthSlot from './AuthSlot.vue'
import DarkModeSlot from './DarkModeSlot.vue'

defineProps<{
  siteName?: string
  navLinks?: string[]
  authEnabled?: boolean
  darkModeEnabled?: boolean
}>()

const menuOpen = ref(false)
</script>

<template>
  <header class="bg-white border-b border-gray-200 relative">
    <!-- Mobile bar -->
    <div class="md:hidden flex items-center justify-between px-6 py-4">
      <h1 class="text-xl font-bold text-gray-900">{{ siteName || 'Site Name' }}</h1>
      <div class="flex items-center gap-2">
        <DarkModeSlot v-if="darkModeEnabled" />
        <AuthSlot v-if="authEnabled" />
        <button
          class="p-2 text-gray-600"
          @click="menuOpen = !menuOpen"
          :aria-expanded="menuOpen"
        >
          <svg v-if="!menuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Desktop centered layout -->
    <div class="hidden md:block max-w-6xl mx-auto px-6 py-6 text-center relative">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">{{ siteName || 'Site Name' }}</h1>
      <nav class="flex justify-center gap-8">
        <a
          v-for="link in (navLinks || ['Home', 'About', 'Services', 'Contact'])"
          :key="link"
          href="#"
          class="text-gray-600 hover:text-gray-900 transition-colors font-medium"
        >{{ link }}</a>
      </nav>
      <div v-if="authEnabled || darkModeEnabled" class="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <DarkModeSlot v-if="darkModeEnabled" />
        <AuthSlot v-if="authEnabled" />
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-if="menuOpen" class="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
      <nav class="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1">
        <a
          v-for="link in (navLinks || ['Home', 'About', 'Services', 'Contact'])"
          :key="link"
          href="#"
          class="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          @click="menuOpen = false"
        >{{ link }}</a>
      </nav>
    </div>
    <div v-if="menuOpen" class="fixed inset-0 z-40" @click="menuOpen = false" />
  </header>
</template>
