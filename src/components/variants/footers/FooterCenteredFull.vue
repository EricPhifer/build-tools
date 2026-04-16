<script setup lang="ts">
defineProps<{
  siteName?: string
  tagline?: string
  navLinks?: string[]
  socialLinks?: string[]
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

const socialIcons: Record<string, string[]> = {
  twitter: ['M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z'],
  x: ['M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z'],
  facebook: ['M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z'],
  instagram: [
    'M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z',
    'M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z',
    'M17.5 6.5h.01'
  ],
  linkedin: [
    'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z',
    'M2 9h4v12H2z',
    'M4 6a2 2 0 100-4 2 2 0 000 4z'
  ],
  youtube: [
    'M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z',
    'M9.75 15.02L15.5 12l-5.75-3.02v6.04z'
  ],
  github: ['M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22'],
}

function getSocialPaths(platform: string): string[] {
  return socialIcons[platform.toLowerCase()] ?? ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71']
}
</script>

<template>
  <footer class="bg-gray-50 border-t border-gray-200">
    <div class="max-w-6xl mx-auto px-6 py-14 flex flex-col items-center text-center gap-7">

      <!-- Brand + tagline -->
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-1">{{ siteName || 'Your Brand' }}</h2>
        <p class="text-gray-500 text-sm">{{ tagline || 'Helping businesses grow online.' }}</p>
      </div>

      <!-- Nav links -->
      <nav class="flex flex-wrap justify-center gap-x-7 gap-y-2">
        <a
          v-for="link in (navLinks || ['About', 'Services', 'Portfolio', 'Blog', 'Contact'])"
          :key="link"
          href="#"
          class="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >{{ link }}</a>
      </nav>

      <!-- Social icon circles -->
      <div v-if="socialLinks?.length" class="flex justify-center gap-3">
        <a
          v-for="platform in socialLinks"
          :key="platform"
          href="#"
          :aria-label="platform"
          :title="platform"
          class="w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm"
        >
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
            <path v-for="d in getSocialPaths(platform)" :key="d" stroke-linecap="round" stroke-linejoin="round" :d="d"/>
          </svg>
        </a>
      </div>

      <!-- NAP block -->
      <address v-if="businessContact && (businessContact.streetAddress || businessContact.phone || businessContact.city)"
        class="not-italic text-sm text-gray-500 leading-relaxed">
        <div v-if="businessContact.streetAddress">{{ businessContact.streetAddress }}</div>
        <div v-if="businessContact.city || businessContact.region || businessContact.postalCode">
          <span v-if="businessContact.city">{{ businessContact.city }}</span><span v-if="businessContact.city && businessContact.region">, </span><span v-if="businessContact.region">{{ businessContact.region }}</span><span v-if="businessContact.postalCode"> {{ businessContact.postalCode }}</span>
        </div>
        <div v-if="businessContact.phone || businessContact.email" class="mt-1">
          <a v-if="businessContact.phone" :href="`tel:${businessContact.phone}`" class="hover:text-gray-800">{{ businessContact.phone }}</a>
          <span v-if="businessContact.phone && businessContact.email" class="text-gray-300 mx-2">·</span>
          <a v-if="businessContact.email" :href="`mailto:${businessContact.email}`" class="hover:text-gray-800">{{ businessContact.email }}</a>
        </div>
      </address>

      <!-- Copyright -->
      <div class="text-center">
        <p class="text-gray-400 text-xs">&copy; {{ copyrightText || '2026 Company Name. All rights reserved.' }}</p>
        <p class="text-gray-400 text-xs mt-1">{{ craftedBy || 'Crafted by Phifer Web Solutions' }}</p>
      </div>
    </div>
  </footer>
</template>
