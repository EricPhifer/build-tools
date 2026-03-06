<script setup lang="ts">
defineProps<{
  copyrightText?: string
  socialLinks?: string[]
  navLinks?: string[]
}>()
</script>

<template>
  <footer class="bg-gray-50 border-t border-gray-200">
    <div class="max-w-6xl mx-auto px-6 py-8 text-center">
      <div v-if="socialLinks?.length" class="flex justify-center gap-6 mb-4">
        <a
          v-for="link in socialLinks"
          :key="link"
          href="#"
          class="text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium"
        >{{ link }}</a>
      </div>
      <div class="flex justify-center gap-5 mb-4">
        <a
          v-for="link in (navLinks || ['Privacy Policy', 'Terms & Conditions', 'Accessibility'])"
          :key="link"
          href="#"
          class="text-gray-400 hover:text-gray-600 text-xs transition-colors whitespace-nowrap"
        >{{ link }}</a>
      </div>
      <p class="text-gray-500 text-sm">&copy; {{ copyrightText || '2026 Company Name. All rights reserved.' }}</p>
    </div>
  </footer>
</template>
