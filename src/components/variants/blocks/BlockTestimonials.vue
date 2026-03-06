<script setup lang="ts">
import { useSiteContext, colorWithOpacity } from '../../../composables/useSiteContext'

withDefaults(defineProps<{
  heading?: string
  testimonials?: Array<{ quote: string; name: string; title: string; rating?: number }>
}>(), {
  heading: 'What Our Clients Say',
  testimonials: () => [
    { quote: 'Working with this team completely transformed how we operate. The results exceeded every expectation we had going in.', name: 'Sarah Mitchell', title: 'CEO, Brightline Co.', rating: 5 },
    { quote: 'Exceptional service from start to finish. They listened carefully, delivered on time, and were a pleasure to work with throughout.', name: 'James Okafor', title: 'Director of Operations, Nexus Group', rating: 5 },
    { quote: 'I was sceptical at first, but the outcome speaks for itself. Our revenue grew 40% in the first quarter after launch.', name: 'Priya Nair', title: 'Founder, Stellar Retail', rating: 5 },
  ]
})

const site = useSiteContext()
</script>

<template>
  <section class="py-16 px-6 bg-white @container">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900">{{ heading }}</h2>
      </div>

      <div class="grid grid-cols-1 @md:grid-cols-3 gap-6">
        <div
          v-for="t in testimonials"
          :key="t.name"
          class="flex flex-col bg-gray-50 rounded-2xl p-6 border border-gray-100"
        >
          <!-- Stars -->
          <div class="flex gap-0.5 mb-4">
            <span v-for="n in (t.rating ?? 5)" :key="n" class="text-amber-400 text-sm">★</span>
          </div>

          <!-- Quote -->
          <p class="text-gray-700 text-sm leading-relaxed flex-1 mb-6">"{{ t.quote }}"</p>

          <!-- Author -->
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              :style="{ backgroundColor: colorWithOpacity(site.primaryColor, 0.1), color: site.primaryColor }"
            >
              {{ t.name.charAt(0) }}
            </div>
            <div>
              <p class="font-semibold text-gray-900 text-sm">{{ t.name }}</p>
              <p class="text-gray-500 text-xs">{{ t.title }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
