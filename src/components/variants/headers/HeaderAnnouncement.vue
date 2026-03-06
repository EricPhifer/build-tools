<script setup lang="ts">
import { ref } from 'vue'
import AuthSlot from './AuthSlot.vue'
import DarkModeSlot from './DarkModeSlot.vue'

defineProps<{
  siteName?: string
  navLinks?: string[]
  announcementText?: string
  announcementLinkLabel?: string
  announcementLinkUrl?: string
  authEnabled?: boolean
  darkModeEnabled?: boolean
}>()

const dismissed = ref(false)
const menuOpen = ref(false)
</script>

<template>
  <div>
    <!-- Announcement bar -->
    <div
      v-if="!dismissed"
      class="bg-blue-600 text-white text-sm px-6 py-2 flex items-center justify-center gap-4"
    >
      <span>{{ announcementText || '🎉 Special offer — limited time only.' }}</span>
      <a
        v-if="announcementLinkLabel"
        :href="announcementLinkUrl || '#'"
        class="underline font-semibold hover:no-underline"
      >{{ announcementLinkLabel }}</a>
      <button
        @click="dismissed = true"
        class="ml-auto text-white/70 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Main header -->
    <header class="bg-white border-b border-gray-200 relative">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900">{{ siteName || 'Site Name' }}</h1>
        <nav class="hidden md:flex items-center gap-6">
          <a
            v-for="link in (navLinks || ['Home', 'About', 'Services', 'Contact'])"
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
  </div>
</template>
