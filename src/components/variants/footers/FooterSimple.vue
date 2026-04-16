<script setup lang="ts">
defineProps<{
  copyrightText?: string
  craftedBy?: string
  socialLinks?: string[]
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
  <footer class="bg-gray-50 border-t border-gray-200">
    <div class="max-w-6xl mx-auto px-6 py-8 text-center">
      <!-- NAP Block -->
      <address v-if="businessContact && (businessContact.streetAddress || businessContact.phone || businessContact.city)"
        class="not-italic text-sm text-gray-600 mb-4 leading-relaxed">
        <div v-if="businessContact.businessName" class="font-medium text-gray-800">{{ businessContact.businessName }}</div>
        <div v-if="businessContact.streetAddress">{{ businessContact.streetAddress }}</div>
        <div v-if="businessContact.city || businessContact.region || businessContact.postalCode">
          <span v-if="businessContact.city">{{ businessContact.city }}</span><span v-if="businessContact.city && businessContact.region">, </span><span v-if="businessContact.region">{{ businessContact.region }}</span><span v-if="businessContact.postalCode"> {{ businessContact.postalCode }}</span>
        </div>
        <div v-if="businessContact.phone || businessContact.email" class="mt-1">
          <a v-if="businessContact.phone" :href="`tel:${businessContact.phone}`" class="hover:text-gray-900">{{ businessContact.phone }}</a>
          <span v-if="businessContact.phone && businessContact.email" class="text-gray-400 mx-2">·</span>
          <a v-if="businessContact.email" :href="`mailto:${businessContact.email}`" class="hover:text-gray-900">{{ businessContact.email }}</a>
        </div>
      </address>
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
      <p class="text-gray-400 text-xs mt-2">{{ craftedBy || 'Crafted by Phifer Web Solutions' }}</p>
    </div>
  </footer>
</template>