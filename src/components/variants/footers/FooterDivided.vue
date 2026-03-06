<script setup lang="ts">
defineProps<{
  siteName?: string
  socialLinks?: string[]
  navLinks?: string[]
  copyrightText?: string
}>()
</script>

<template>
  <footer class="bg-white border-t border-gray-200">
    <div class="max-w-6xl mx-auto px-6">

      <!-- Row 1: Brand + social text links -->
      <div class="py-6 flex items-center justify-between gap-4 flex-wrap">
        <span class="text-lg font-bold text-gray-900">{{ siteName || 'Your Brand' }}</span>
        <div v-if="socialLinks?.length" class="flex gap-5">
          <a
            v-for="link in socialLinks"
            :key="link"
            href="#"
            class="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors"
          >{{ link }}</a>
        </div>
      </div>

      <div class="border-t border-gray-100" />

      <!-- Row 2: Nav links centered -->
      <div class="py-5 flex items-center justify-center gap-7 flex-wrap">
        <a
          v-for="link in (navLinks || ['About', 'Services', 'Portfolio', 'Blog', 'Contact'])"
          :key="link"
          href="#"
          class="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >{{ link }}</a>
      </div>

      <div class="border-t border-gray-100" />

      <!-- Row 3: Copyright centered -->
      <div class="py-4 text-center">
        <p class="text-xs text-gray-400">&copy; {{ copyrightText || '2026 Company Name. All rights reserved.' }}</p>
      </div>
    </div>
  </footer>
</template>
