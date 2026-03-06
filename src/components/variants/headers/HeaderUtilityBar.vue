<script setup lang="ts">
import { ref } from 'vue'
import AuthSlot from './AuthSlot.vue'
import DarkModeSlot from './DarkModeSlot.vue'

defineProps<{
  siteName?: string
  navLinks?: string[]
  phone?: string
  hoursLabel?: string
  authEnabled?: boolean
  darkModeEnabled?: boolean
}>()

const menuOpen = ref(false)
</script>

<template>
  <div>
    <!-- Utility bar -->
    <div class="bg-gray-800 text-gray-300 text-xs px-6 py-2">
      <div class="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <!-- Left: phone + hours -->
        <div class="flex items-center gap-5">
          <span v-if="phone || true" class="flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            {{ phone || '(555) 123-4567' }}
          </span>
          <span class="flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ hoursLabel || 'Mon–Fri 9am–5pm' }}
          </span>
        </div>
        <!-- Right: social icons placeholder -->
        <div class="flex items-center gap-3">
          <a href="#" class="hover:text-white transition-colors" aria-label="Facebook">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
          </a>
          <a href="#" class="hover:text-white transition-colors" aria-label="Instagram">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>
          <a href="#" class="hover:text-white transition-colors" aria-label="LinkedIn">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
          </a>
        </div>
      </div>
    </div>

    <!-- Main nav -->
    <header class="bg-white border-b border-gray-200 relative">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900">{{ siteName || 'Site Name' }}</h1>
        <nav class="hidden md:flex items-center gap-6">
          <a
            v-for="link in (navLinks || ['Home', 'About', 'Services', 'Patients', 'Contact'])"
            :key="link"
            href="#"
            class="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm"
          >{{ link }}</a>
        </nav>
        <div class="flex items-center gap-2">
          <DarkModeSlot v-if="darkModeEnabled" />
          <AuthSlot v-if="authEnabled" />
          <button
            class="md:hidden p-2 text-gray-600"
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

      <!-- Mobile menu -->
      <div v-if="menuOpen" class="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
        <nav class="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1">
          <a
            v-for="link in (navLinks || ['Home', 'About', 'Services', 'Patients', 'Contact'])"
            :key="link"
            href="#"
            class="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            @click="menuOpen = false"
          >{{ link }}</a>
        </nav>
      </div>
      <div v-if="menuOpen" class="fixed inset-0 z-40" @click="menuOpen = false" />
    </header>
  </div>
</template>
