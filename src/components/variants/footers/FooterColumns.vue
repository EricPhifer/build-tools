<script setup lang="ts">
defineProps<{
  copyrightText?: string
  craftedBy?: string
  columns?: Array<{ title: string; links: string[] }>
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

const defaultColumns = [
  { title: 'Company', links: ['About', 'Careers', 'Blog'] },
  { title: 'Support', links: ['Help Center', 'Contact', 'FAQ'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies'] }
]
</script>

<template>
  <footer class="bg-gray-900 text-gray-300">
    <div class="max-w-6xl mx-auto px-6 py-12">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <div v-for="col in (columns || defaultColumns)" :key="col.title">
          <h3 class="text-white font-semibold mb-3">{{ col.title }}</h3>
          <ul class="space-y-2">
            <li v-for="link in col.links" :key="link">
              <a href="#" class="text-sm hover:text-white transition-colors">{{ link }}</a>
            </li>
          </ul>
        </div>
        <!-- Contact Column (NAP) -->
        <div v-if="businessContact && (businessContact.streetAddress || businessContact.phone || businessContact.city)">
          <h3 class="text-white font-semibold mb-3">Contact</h3>
          <address class="not-italic text-sm text-gray-400 space-y-1 leading-relaxed">
            <div v-if="businessContact.businessName" class="text-gray-300">{{ businessContact.businessName }}</div>
            <div v-if="businessContact.streetAddress">{{ businessContact.streetAddress }}</div>
            <div v-if="businessContact.city || businessContact.region || businessContact.postalCode">
              <span v-if="businessContact.city">{{ businessContact.city }}</span><span v-if="businessContact.city && businessContact.region">, </span><span v-if="businessContact.region">{{ businessContact.region }}</span><span v-if="businessContact.postalCode"> {{ businessContact.postalCode }}</span>
            </div>
            <div v-if="businessContact.phone" class="pt-1"><a :href="`tel:${businessContact.phone}`" class="hover:text-white">{{ businessContact.phone }}</a></div>
            <div v-if="businessContact.email"><a :href="`mailto:${businessContact.email}`" class="hover:text-white">{{ businessContact.email }}</a></div>
          </address>
        </div>
      </div>
      <div class="border-t border-gray-700 pt-6 flex flex-wrap justify-between items-center gap-2 text-center">
        <p class="text-sm text-gray-500">&copy; {{ copyrightText || '2026 Company Name. All rights reserved.' }}</p>
        <p class="text-sm text-gray-500">{{ craftedBy || 'Crafted by Phifer Web Solutions' }}</p>
      </div>
    </div>
  </footer>
</template>