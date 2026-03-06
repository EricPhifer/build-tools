<script setup lang="ts">
import { ref } from 'vue'
import AuthSlot from './AuthSlot.vue'
import DarkModeSlot from './DarkModeSlot.vue'

defineProps<{
  siteName?: string
  navLinks?: string[]
  ctaLabel?: string
  ctaUrl?: string
  authEnabled?: boolean
  darkModeEnabled?: boolean
}>()

const menuOpen = ref(false)
</script>

<template>
  <header class="bg-white border-b border-gray-200 relative">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
      <!-- Logo -->
      <h1 class="text-xl font-bold text-gray-900 shrink-0">{{ siteName || 'Site Name' }}</h1>

      <!-- Nav -->
      <nav class="hidden md:flex items-center gap-6 flex-1">
        <a
          v-for="link in (navLinks || ['Home', 'About', 'Services', 'Contact'])"
          :key="link"
          href="#"
          class="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm"
        >{{ link }}</a>
      </nav>

      <!-- CTA + Auth (desktop) -->
      <div class="hidden md:flex items-center gap-2 shrink-0">
        <DarkModeSlot v-if="darkModeEnabled" />
        <AuthSlot v-if="authEnabled" />
        <a
          :href="ctaUrl || '#'"
          class="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >{{ ctaLabel || 'Book Now' }}</a>
      </div>

      <!-- Mobile hamburger -->
      <button class="md:hidden p-2 text-gray-600" @click="menuOpen = !menuOpen" :aria-expanded="menuOpen">
        <svg v-if="!menuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
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
        <div class="pt-3 border-t border-gray-100 mt-2 flex flex-col gap-2">
          <DarkModeSlot v-if="darkModeEnabled" :full-width="true" />
          <AuthSlot v-if="authEnabled" :full-width="true" />
          <a :href="ctaUrl || '#'" class="flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold">
            {{ ctaLabel || 'Book Now' }}
          </a>
        </div>
      </nav>
    </div>
    <div v-if="menuOpen" class="fixed inset-0 z-40" @click="menuOpen = false" />
  </header>
</template>
