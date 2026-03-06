<script setup lang="ts">
defineProps<{
  copyrightText?: string
  navLinks?: string[]
}>()
</script>

<template>
  <footer class="bg-white border-t border-gray-100">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-center gap-6 flex-wrap">
      <a
        v-for="link in (navLinks || ['Privacy Policy', 'Terms & Conditions', 'Accessibility'])"
        :key="link"
        href="#"
        class="text-gray-400 hover:text-gray-600 text-xs transition-colors"
      >{{ link }}</a>
      <span class="text-gray-300 text-xs">·</span>
      <p class="text-gray-400 text-xs">&copy; {{ copyrightText || '2026 Company Name. All rights reserved.' }}</p>
    </div>
  </footer>
</template>
