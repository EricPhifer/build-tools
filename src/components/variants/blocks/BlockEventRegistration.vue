<script setup lang="ts">
import { Calendar, MapPin } from 'lucide-vue-next'

const event = {
  title: 'Spring Community Gathering',
  date: 'Saturday, May 24, 2026 · 10:00 AM',
  location: 'Joseph Center Main Hall · 123 Hope Street'
}
const filled = 14
const capacity = 50
const fillPct = Math.round((filled / capacity) * 100)
</script>

<template>
  <section class="py-16 px-6 bg-white">
    <div class="max-w-2xl mx-auto">
      <!-- Event detail summary -->
      <div class="mb-6 p-6 rounded-xl border border-gray-200 bg-gray-50">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ event.title }}</h2>
        <div class="flex items-center gap-2 text-sm text-gray-600 mb-1">
          <Calendar class="w-4 h-4" /> {{ event.date }}
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <MapPin class="w-4 h-4" /> {{ event.location }}
        </div>
      </div>

      <!-- Capacity bar -->
      <div class="mb-6">
        <div class="flex justify-between text-sm text-gray-600 mb-2">
          <span>{{ filled }} of {{ capacity }} spots filled</span>
          <span class="font-semibold">{{ fillPct }}%</span>
        </div>
        <div class="h-3 rounded-full bg-gray-200 overflow-hidden">
          <div class="h-full transition-all" :style="{ width: `${fillPct}%`, backgroundColor: 'var(--color-secondary, #d4a017)' }" />
        </div>
      </div>

      <!-- Form -->
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <input type="text" disabled placeholder="First name" class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50" />
          <input type="text" disabled placeholder="Last name" class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50" />
        </div>
        <input type="email" disabled placeholder="Email" class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50" />
        <input type="tel" disabled placeholder="Phone" class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50" />
        <input type="number" disabled placeholder="Party size" class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50" />
        <textarea rows="3" disabled placeholder="Notes (allergies, accessibility, etc.)" class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50" />
        <button
          type="button"
          disabled
          class="w-full py-3 rounded-full text-white font-semibold"
          :style="{ backgroundColor: 'var(--color-primary)' }"
        >Reserve Your Spot</button>
      </div>
    </div>
  </section>
</template>
