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

const searchOpen = ref(false)
const query = ref('')
const menuOpen = ref(false)
</script>

<template>
  <header class="bg-white border-b border-gray-200 relative z-40">
    <!-- Main bar -->
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
      <h1 class="text-xl font-bold text-gray-900 shrink-0">{{ siteName || 'Site Name' }}</h1>

      <nav class="hidden md:flex items-center gap-6 flex-1">
        <a
          v-for="link in (navLinks || ['Home', 'Articles', 'Topics', 'About'])"
          :key="link"
          href="#"
          class="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm"
        >{{ link }}</a>
      </nav>

      <!-- Search + Auth (desktop) -->
      <div class="hidden md:flex items-center gap-2">
        <div v-if="searchOpen" class="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            v-model="query"
            type="text"
            placeholder="Search..."
            class="bg-transparent text-sm outline-none w-40 text-gray-700 placeholder-gray-400"
            autofocus
          />
          <button @click="searchOpen = false; query = ''" class="text-gray-400 hover:text-gray-600">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <button v-else @click="searchOpen = true" class="p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
        <DarkModeSlot v-if="darkModeEnabled" />
        <AuthSlot v-if="authEnabled" />
      </div>

      <!-- Mobile right: search icon + hamburger -->
      <div class="md:hidden flex items-center gap-1">
        <button @click="searchOpen = !searchOpen" class="p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
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

    <!-- Mobile search bar -->
    <div v-if="searchOpen" class="md:hidden px-6 pb-3">
      <div class="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
        <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="query"
          type="text"
          placeholder="Search..."
          class="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder-gray-400"
          autofocus
        />
        <button @click="searchOpen = false; query = ''" class="text-gray-400 hover:text-gray-600 shrink-0">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile nav menu -->
    <div v-if="menuOpen" class="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
      <nav class="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1">
        <a
          v-for="link in (navLinks || ['Home', 'Articles', 'Topics', 'About'])"
          :key="link"
          href="#"
          class="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          @click="menuOpen = false"
        >{{ link }}</a>
      </nav>
      <div v-if="authEnabled || darkModeEnabled" class="max-w-6xl mx-auto px-6 pb-4 pt-3 border-t border-gray-100 flex flex-col gap-2">
        <DarkModeSlot v-if="darkModeEnabled" :full-width="true" />
        <AuthSlot v-if="authEnabled" :full-width="true" />
      </div>
    </div>
    <div v-if="menuOpen" class="fixed inset-0 z-40" @click="menuOpen = false" />
  </header>
</template>
