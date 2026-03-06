<script setup lang="ts">
import { useSiteContext, colorWithOpacity } from '../../../composables/useSiteContext'

withDefaults(defineProps<{
  heading?: string
  subheading?: string
  steps?: Array<{ title: string; description: string; icon: string }>
}>(), {
  heading: 'How It Works',
  subheading: 'A simple, proven process designed to get you results without the guesswork.',
  steps: () => [
    { icon: '📋', title: 'Discovery Call', description: 'We learn about your goals, challenges, and what success looks like for your business.' },
    { icon: '🗺️', title: 'Strategy & Plan', description: 'We build a tailored roadmap with clear milestones, timelines, and deliverables.' },
    { icon: '⚙️', title: 'Implementation', description: 'Our team executes with precision, keeping you informed at every step of the process.' },
    { icon: '🚀', title: 'Launch & Grow', description: 'We go live, measure results, and continuously optimise to drive ongoing growth.' },
  ]
})

const site = useSiteContext()
</script>

<template>
  <section class="py-16 px-6 bg-gray-50 @container">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-3">{{ heading }}</h2>
        <p class="text-gray-500 text-base max-w-xl mx-auto">{{ subheading }}</p>
      </div>

      <!-- Steps -->
      <div class="grid grid-cols-1 @md:grid-cols-4 gap-0">
        <div
          v-for="(step, idx) in steps"
          :key="step.title"
          class="relative flex flex-col items-center text-center px-4"
        >
          <!-- Connector line (hidden for last step) -->
          <div
            v-if="idx < steps.length - 1"
            class="hidden @md:block absolute top-8 left-1/2 w-full h-0.5"
            :style="{ left: '50%', transform: 'translateX(0)', backgroundColor: colorWithOpacity(site.primaryColor, 0.2) }"
          />

          <!-- Step circle -->
          <div
            class="relative z-10 w-16 h-16 rounded-full bg-white border-2 flex items-center justify-center text-2xl mb-4 shadow-sm"
            :style="{ borderColor: colorWithOpacity(site.primaryColor, 0.35) }"
          >
            {{ step.icon }}
          </div>

          <!-- Step number badge -->
          <div
            class="absolute top-0 right-6 @md:right-4 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
            :style="{ backgroundColor: site.primaryColor }"
          >
            {{ idx + 1 }}
          </div>

          <h3 class="font-semibold text-gray-900 mb-2">{{ step.title }}</h3>
          <p class="text-gray-500 text-sm leading-relaxed">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
