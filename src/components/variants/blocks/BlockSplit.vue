<script setup lang="ts">
import { useSiteContext, colorWithOpacity } from '../../../composables/useSiteContext'

withDefaults(defineProps<{
  eyebrow?: string
  heading?: string
  body?: string
  ctaLabel?: string
  ctaUrl?: string
  imageRight?: boolean
  features?: Array<{ icon: string; text: string }>
}>(), {
  eyebrow: 'About Us',
  heading: 'Built for Businesses That Mean Business',
  body: 'We combine deep industry expertise with modern thinking to deliver results that last. Our team works alongside yours — understanding your goals, your customers, and your challenges before we ever propose a solution.',
  ctaLabel: 'Learn More',
  ctaUrl: '#',
  imageRight: true,
  features: () => [
    { icon: '✓', text: 'Tailored to your specific industry' },
    { icon: '✓', text: 'Transparent process from day one' },
    { icon: '✓', text: 'Measurable outcomes, not just activity' },
  ]
})

const site = useSiteContext()
</script>

<template>
  <section class="py-16 px-6 bg-white">
    <div
      class="max-w-5xl mx-auto flex flex-col gap-10 items-center"
      :class="imageRight ? 'md:flex-row' : 'md:flex-row-reverse'"
    >
      <!-- Text column -->
      <div class="flex-1 min-w-0">
        <p v-if="eyebrow" class="text-sm font-semibold uppercase tracking-widest mb-3" :style="{ color: site.primaryColor }">{{ eyebrow }}</p>
        <h2 class="text-3xl font-bold text-gray-900 mb-4 leading-tight">{{ heading }}</h2>
        <p class="text-gray-600 text-base leading-relaxed mb-6">{{ body }}</p>

        <ul v-if="features?.length" class="space-y-2 mb-8">
          <li v-for="f in features" :key="f.text" class="flex items-start gap-2 text-sm text-gray-700">
            <span class="font-bold mt-0.5" :style="{ color: site.primaryColor }">{{ f.icon }}</span>
            {{ f.text }}
          </li>
        </ul>

        <a
          :href="ctaUrl"
          class="inline-block text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          :style="{ backgroundColor: site.primaryColor }"
        >{{ ctaLabel }}</a>
      </div>

      <!-- Image column -->
      <div class="flex-1 min-w-0">
        <div
          class="aspect-4/3 rounded-2xl flex items-center justify-center text-5xl shadow-sm"
          :style="{ background: `linear-gradient(135deg, ${colorWithOpacity(site.primaryColor, 0.08)}, ${colorWithOpacity(site.secondaryColor, 0.14)})` }"
        >
          🏢
        </div>
      </div>
    </div>
  </section>
</template>
