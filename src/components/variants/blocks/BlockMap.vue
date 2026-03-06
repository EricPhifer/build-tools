<script setup lang="ts">
import { useSiteContext } from '../../../composables/useSiteContext'

withDefaults(defineProps<{
  heading?: string
  address?: string
  phone?: string
  email?: string
  hours?: string
}>(), {
  heading: 'Find Us',
  address: '123 Business Avenue, Suite 400\nNew York, NY 10001',
  phone: '+1 (555) 123-4567',
  email: '',
  hours: 'Mon – Fri: 9am – 6pm'
})

const site = useSiteContext()
</script>

<template>
  <section class="py-16 px-6 bg-white @container">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-10">
        <h2 class="text-3xl font-bold text-gray-900">{{ heading }}</h2>
      </div>

      <div class="grid grid-cols-1 @lg:grid-cols-3 gap-8 items-start">
        <!-- Info panel -->
        <div class="space-y-6">
          <div>
            <p class="text-xs font-semibold uppercase tracking-widest mb-1" :style="{ color: site.primaryColor }">Address</p>
            <p class="text-gray-700 text-sm whitespace-pre-line">{{ address }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-widest mb-1" :style="{ color: site.primaryColor }">Phone</p>
            <p class="text-gray-700 text-sm">{{ phone }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-widest mb-1" :style="{ color: site.primaryColor }">Email</p>
            <p class="text-gray-700 text-sm">{{ email || site.contactEmail }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-widest mb-1" :style="{ color: site.primaryColor }">Hours</p>
            <p class="text-gray-700 text-sm">{{ hours }}</p>
          </div>
        </div>

        <!-- Map placeholder -->
        <div class="@lg:col-span-2 rounded-xl overflow-hidden border border-gray-200 shadow-sm h-80 bg-gray-100 flex items-center justify-center">
          <div class="text-center text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <p class="text-sm font-medium">Map Embed</p>
            <p class="text-xs mt-1">Google Maps will appear here</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
