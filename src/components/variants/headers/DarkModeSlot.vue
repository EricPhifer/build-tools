<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  fullWidth?: boolean
}>()

const isDark = ref(false)

function toggle() {
  isDark.value = !isDark.value
  // In production this would call the site's theme store / toggle a class on <html>
  document.documentElement.classList.toggle('dark', isDark.value)
}
</script>

<template>
  <button
    @click="toggle"
    :class="fullWidth
      ? 'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors hover:bg-gray-50'
      : 'flex items-center justify-center w-9 h-9 rounded-lg border transition-colors hover:bg-gray-50'"
    style="border-color: #d1d5db; color: #374151;"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <!-- Sun icon (shown when dark mode is active) -->
    <svg v-if="isDark" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
    </svg>
    <!-- Moon icon (shown when light mode is active) -->
    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
    </svg>
    <span v-if="fullWidth" class="text-sm">{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
  </button>
</template>
