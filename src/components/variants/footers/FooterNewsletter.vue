<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  newsletterHeadline?: string
  newsletterSubtext?: string
  columns?: Array<{ title: string; links: string[] }>
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

const email = ref('')
const submitted = ref(false)

function subscribe() {
  if (email.value) submitted.value = true
}
</script>

<template>
  <footer class="bg-white border-t border-gray-200">
    <div class="max-w-6xl mx-auto px-6 py-12">
      <div class="grid md:grid-cols-2 gap-10 mb-10">

        <!-- Newsletter signup -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-1">
            {{ newsletterHeadline || 'Stay in the loop' }}
          </h3>
          <p class="text-gray-500 text-sm mb-5">
            {{ newsletterSubtext || 'Get updates on news, tips, and resources — no spam.' }}
          </p>
          <div v-if="!submitted" class="flex gap-2">
            <input
              v-model="email"
              type="email"
              placeholder="you@example.com"
              class="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <button
              @click="subscribe"
              class="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors shrink-0"
            >Subscribe</button>
          </div>
          <p v-else class="text-sm text-green-600 font-medium">Thanks! You're subscribed.</p>
        </div>

        <!-- Link columns -->
        <div class="grid grid-cols-2 gap-8">
          <div
            v-for="col in (columns || [{ title: 'Company', links: ['About', 'Services', 'Contact'] }, { title: 'Legal', links: ['Privacy Policy', 'Terms', 'Cookies'] }])"
            :key="col.title"
          >
            <h4 class="text-sm font-semibold text-gray-900 mb-3">{{ col.title }}</h4>
            <ul class="space-y-2">
              <li v-for="link in col.links" :key="link">
                <a href="#" class="text-sm text-gray-500 hover:text-gray-800 transition-colors">{{ link }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- NAP block -->
      <div v-if="businessContact && (businessContact.streetAddress || businessContact.phone || businessContact.city)"
        class="border-t border-gray-100 pt-6 pb-4 text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1 leading-relaxed">
        <span v-if="businessContact.streetAddress">{{ businessContact.streetAddress }}</span>
        <span v-if="businessContact.city || businessContact.region || businessContact.postalCode">
          <span v-if="businessContact.city">{{ businessContact.city }}</span><span v-if="businessContact.city && businessContact.region">, </span><span v-if="businessContact.region">{{ businessContact.region }}</span><span v-if="businessContact.postalCode"> {{ businessContact.postalCode }}</span>
        </span>
        <a v-if="businessContact.phone" :href="`tel:${businessContact.phone}`" class="hover:text-gray-800">{{ businessContact.phone }}</a>
        <a v-if="businessContact.email" :href="`mailto:${businessContact.email}`" class="hover:text-gray-800">{{ businessContact.email }}</a>
      </div>

      <!-- Bottom bar -->
      <div class="border-t border-gray-100 pt-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p class="text-gray-400 text-sm">&copy; {{ copyrightText || '2026 Company Name. All rights reserved.' }}</p>
          <p class="text-gray-400 text-xs mt-1">{{ craftedBy || 'Crafted by Phifer Web Solutions' }}</p>
        </div>
        <div v-if="socialLinks?.length" class="flex gap-5">
          <a
            v-for="link in socialLinks"
            :key="link"
            href="#"
            class="text-gray-400 hover:text-gray-600 text-sm transition-colors"
          >{{ link }}</a>
        </div>
      </div>
    </div>
  </footer>
</template>
