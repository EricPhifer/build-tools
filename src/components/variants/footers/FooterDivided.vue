<script setup lang="ts">
defineProps<{
  siteName?: string
  socialLinks?: string[]
  navLinks?: string[]
  copyrightText?: string
  craftedBy?: string
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

      <!-- Row 3: NAP -->
      <div v-if="businessContact && (businessContact.streetAddress || businessContact.phone || businessContact.city)"
        class="py-4 text-center text-xs text-gray-500 flex flex-wrap justify-center gap-x-3 gap-y-1">
        <span v-if="businessContact.streetAddress">{{ businessContact.streetAddress }}</span>
        <span v-if="businessContact.city || businessContact.region || businessContact.postalCode">
          <span v-if="businessContact.city">{{ businessContact.city }}</span><span v-if="businessContact.city && businessContact.region">, </span><span v-if="businessContact.region">{{ businessContact.region }}</span><span v-if="businessContact.postalCode"> {{ businessContact.postalCode }}</span>
        </span>
        <a v-if="businessContact.phone" :href="`tel:${businessContact.phone}`" class="hover:text-gray-800">{{ businessContact.phone }}</a>
        <a v-if="businessContact.email" :href="`mailto:${businessContact.email}`" class="hover:text-gray-800">{{ businessContact.email }}</a>
      </div>

      <div v-if="businessContact && (businessContact.streetAddress || businessContact.phone || businessContact.city)" class="border-t border-gray-100" />

      <!-- Row 4: Copyright centered -->
      <div class="py-4 text-center">
        <p class="text-xs text-gray-400">&copy; {{ copyrightText || '2026 Company Name. All rights reserved.' }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ craftedBy || 'Crafted by Phifer Web Solutions' }}</p>
      </div>
    </div>
  </footer>
</template>