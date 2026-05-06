<script setup lang="ts">
import { Download } from 'lucide-vue-next'

const reports = [
  { year: 2025, title: 'Annual Report 2025' },
  { year: 2025, title: 'Form 990 (2025)' },
  { year: 2024, title: 'Annual Report 2024' },
  { year: 2024, title: 'Form 990 (2024)' },
  { year: 2023, title: 'Annual Report 2023' }
]
</script>

<template>
  <section class="py-16 px-6" :style="{ backgroundColor: 'var(--color-bg-secondary, #faf6ee)' }">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-3xl font-bold text-center mb-2" :style="{ color: 'var(--color-primary)' }">Transparency</h2>
      <p class="text-center text-gray-600 mb-10">Annual reports, 990s, and audited financials.</p>
      <div class="space-y-1">
        <a
          v-for="r in reports"
          :key="`${r.year}-${r.title}`"
          href="#"
          class="flex justify-between items-center py-4 border-b border-gray-200 hover:bg-white/40 transition-colors px-2 rounded"
        >
          <div class="flex items-center gap-6">
            <span class="text-2xl font-bold w-16" :style="{ color: 'var(--color-primary)' }">{{ r.year }}</span>
            <span class="text-gray-800">{{ r.title }}</span>
          </div>
          <Download class="w-5 h-5 text-gray-500" />
        </a>
      </div>
    </div>
  </section>
</template>
