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
  <header class="bg-white border-b border-gray-100 relative">
    <div class="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
      <span class="text-lg font-semibold text-gray-800">{{ siteName || 'Site Name' }}</span>
      <div class="flex items-center gap-2">
        <DarkModeSlot v-if="darkModeEnabled" />
        <AuthSlot v-if="authEnabled" />
        <button
          @click="menuOpen = !menuOpen"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          :aria-expanded="menuOpen"
        >
          <!-- Hamburger → X swap -->
          <svg v-if="!menuOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile menu panel -->
    <div
      v-if="menuOpen"
      class="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50"
    >
      <nav class="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1">
        <a
          v-for="link in (navLinks || ['Home', 'About', 'Services', 'Contact'])"
          :key="link"
          href="#"
          class="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          @click="menuOpen = false"
        >{{ link }}</a>
      </nav>
    </div>

    <!-- Backdrop -->
    <div v-if="menuOpen" class="fixed inset-0 z-40" @click="menuOpen = false" />
  </header>
</template>
