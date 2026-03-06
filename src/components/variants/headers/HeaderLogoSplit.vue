<script setup lang="ts">
import { ref, computed } from 'vue'
import AuthSlot from './AuthSlot.vue'
import DarkModeSlot from './DarkModeSlot.vue'

const props = defineProps<{
  siteName?: string
  navLinks?: string[]
  authEnabled?: boolean
  darkModeEnabled?: boolean
}>()

const links = computed(() => props.navLinks || ['About', 'Menu', 'Events', 'Gallery', 'Contact'])
const leftLinks = computed(() => links.value.slice(0, Math.floor(links.value.length / 2)))
const rightLinks = computed(() => links.value.slice(Math.floor(links.value.length / 2)))

const menuOpen = ref(false)
</script>

<template>
  <header class="bg-white border-b border-gray-200 relative">
    <!-- Desktop: split layout -->
    <div class="max-w-6xl mx-auto px-6 py-4 hidden md:flex items-center justify-between gap-6">
      <nav class="flex items-center gap-6 flex-1 justify-end">
        <a
          v-for="link in leftLinks"
          :key="link"
          href="#"
          class="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm"
        >{{ link }}</a>
      </nav>
      <h1 class="text-xl font-bold text-gray-900 shrink-0 px-6">{{ siteName || 'Brand' }}</h1>
      <nav class="flex items-center gap-6 flex-1">
        <a
          v-for="link in rightLinks"
          :key="link"
          href="#"
          class="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm"
        >{{ link }}</a>
        <DarkModeSlot v-if="darkModeEnabled" />
        <AuthSlot v-if="authEnabled" />
      </nav>
    </div>

    <!-- Mobile bar -->
    <div class="md:hidden flex items-center justify-between px-6 py-4">
      <h1 class="text-xl font-bold text-gray-900">{{ siteName || 'Brand' }}</h1>
      <button class="p-2 text-gray-600" @click="menuOpen = !menuOpen" :aria-expanded="menuOpen">
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
          v-for="link in links"
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
