<script setup lang="ts">
defineProps<{
  ctaHeadline?: string
  ctaSubtext?: string
  ctaLabel?: string
  ctaUrl?: string
  socialLinks?: string[]
  navLinks?: string[]
  copyrightText?: string
}>()
</script>

<template>
  <footer>
    <!-- CTA band -->
    <div class="bg-gray-900 text-white px-6 py-16">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-3xl font-bold mb-3">{{ ctaHeadline || "Ready to get started?" }}</h2>
        <p class="text-gray-400 text-lg mb-8">{{ ctaSubtext || "Let's build something great together." }}</p>
        <a
          :href="ctaUrl || '#'"
          class="inline-flex items-center px-8 py-3 rounded-xl bg-white text-gray-900 font-semibold text-base hover:bg-gray-100 transition-colors"
        >{{ ctaLabel || 'Book a Free Call' }}</a>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="bg-black px-6 py-5">
      <div class="max-w-6xl mx-auto">
        <!-- Legal nav links -->
        <div class="flex justify-center gap-5 flex-wrap mb-3">
          <a
            v-for="link in (navLinks || ['Privacy Policy', 'Terms & Conditions', 'Accessibility'])"
            :key="link"
            href="#"
            class="text-gray-600 hover:text-gray-400 text-xs transition-colors"
          >{{ link }}</a>
        </div>
        <!-- Copyright + social -->
        <div class="flex items-center justify-between gap-4 flex-wrap">
          <p class="text-gray-500 text-sm">&copy; {{ copyrightText || '2026 Company Name. All rights reserved.' }}</p>
          <div v-if="socialLinks?.length" class="flex gap-5">
            <a
              v-for="link in socialLinks"
              :key="link"
              href="#"
              class="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >{{ link }}</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
