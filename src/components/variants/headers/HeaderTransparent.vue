<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import AuthSlot from './AuthSlot.vue'
import DarkModeSlot from './DarkModeSlot.vue'

const props = defineProps<{
  siteName?: string
  navLinks?: string[]
  authEnabled?: boolean
  darkModeEnabled?: boolean
  // previewMode disables fixed positioning so the component renders correctly
  // inside the picker preview container instead of attaching to the viewport
  previewMode?: boolean
}>()

const scrolled = ref(false)
const menuOpen = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 60
}

onMounted(() => {
  if (!props.previewMode) window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => {
  if (!props.previewMode) window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <header
    class="transition-all duration-300 z-50"
    :class="[
      previewMode ? 'relative' : 'fixed top-0 left-0 right-0',
      previewMode || scrolled ? 'bg-white border-b border-gray-200 shadow-sm' : 'bg-transparent'
    ]"
  >
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <!-- Logo -->
      <h1
        class="text-xl font-bold transition-colors duration-300"
        :class="previewMode || scrolled ? 'text-gray-900' : 'text-white'"
      >{{ siteName || 'Site Name' }}</h1>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-6">
        <a
          v-for="link in (navLinks || ['Home', 'About', 'Services', 'Contact'])"
          :key="link"
          href="#"
          class="font-medium text-sm transition-colors duration-300"
          :class="previewMode || scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/90 hover:text-white'"
        >{{ link }}</a>
      </nav>

      <div class="flex items-center gap-2">
        <DarkModeSlot v-if="darkModeEnabled" />
        <AuthSlot v-if="authEnabled" />

        <!-- Mobile hamburger -->
        <button
          class="md:hidden p-2 transition-colors duration-300"
          :class="previewMode || scrolled ? 'text-gray-600' : 'text-white'"
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
    <div v-if="menuOpen" class="md:hidden bg-white border-b border-gray-200 shadow-lg">
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

    <!-- Preview mode note -->
    <div v-if="previewMode" class="px-6 pb-3">
      <p class="text-xs text-gray-400 italic">
        In production: starts transparent over a hero image, transitions to white on scroll.
      </p>
    </div>
  </header>
</template>
