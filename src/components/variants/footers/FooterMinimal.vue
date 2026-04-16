<script setup lang="ts">
defineProps<{
  copyrightText?: string
  craftedBy?: string
  navLinks?: string[]
  businessContact?: {
    businessName?: string
    streetAddress?: string
    city?: string
    region?: string
    postalCode?: string
    phone?: string
    email?: string
  }
}>()
</script>

<template>
  <footer class="bg-white border-t border-gray-100">
    <div class="max-w-6xl mx-auto px-6 py-4">
      <div class="flex items-center justify-center gap-6 flex-wrap">
        <a
          v-for="link in (navLinks || ['Privacy Policy', 'Terms & Conditions', 'Accessibility'])"
          :key="link"
          href="#"
          class="text-gray-400 hover:text-gray-600 text-xs transition-colors"
        >{{ link }}</a>
        <span class="text-gray-300 text-xs">·</span>
        <p class="text-gray-400 text-xs">&copy; {{ copyrightText || '2026 Company Name. All rights reserved.' }}</p>
        <span class="text-gray-300 text-xs">·</span>
        <p class="text-gray-400 text-xs">{{ craftedBy || 'Crafted by Phifer Web Solutions' }}</p>
      </div>
      <div v-if="businessContact && (businessContact.streetAddress || businessContact.phone || businessContact.city)"
        class="mt-2 text-center text-xs text-gray-400">
        <span v-if="businessContact.streetAddress">{{ businessContact.streetAddress }}</span>
        <span v-if="businessContact.streetAddress && (businessContact.city || businessContact.region)"> · </span>
        <span v-if="businessContact.city">{{ businessContact.city }}</span><span v-if="businessContact.city && businessContact.region">, </span><span v-if="businessContact.region">{{ businessContact.region }}</span><span v-if="businessContact.postalCode"> {{ businessContact.postalCode }}</span>
        <span v-if="businessContact.phone && (businessContact.streetAddress || businessContact.city)"> · </span>
        <a v-if="businessContact.phone" :href="`tel:${businessContact.phone}`" class="hover:text-gray-600">{{ businessContact.phone }}</a>
      </div>
    </div>
  </footer>
</template>