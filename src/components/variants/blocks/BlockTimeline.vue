<script setup lang="ts">
import { useSiteContext, colorWithOpacity } from '../../../composables/useSiteContext'

withDefaults(defineProps<{
  heading?: string
  subheading?: string
  milestones?: Array<{ year: string; title: string; description: string }>
}>(), {
  heading: 'Our Journey',
  subheading: 'A decade of growth, learning, and delivering for our clients.',
  milestones: () => [
    { year: '2014', title: 'Founded', description: 'Started as a two-person consultancy with a simple mission: help businesses grow smarter.' },
    { year: '2016', title: 'First Major Client', description: 'Landed our first enterprise client and tripled in size within 12 months.' },
    { year: '2019', title: 'Expanded Nationally', description: 'Opened offices in three new cities and grew the team to over 25 people.' },
    { year: '2021', title: 'Award Winning', description: 'Recognised as one of the top agencies in our space at the annual industry awards.' },
    { year: '2024', title: 'Today', description: 'Serving 500+ clients worldwide with a passionate team of 60+ professionals.' },
  ]
})

const site = useSiteContext()
</script>

<template>
  <section class="py-16 px-6 bg-white">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-3">{{ heading }}</h2>
        <p class="text-gray-500 text-base">{{ subheading }}</p>
      </div>

      <div class="relative">
        <!-- Vertical line -->
        <div
          class="absolute left-8 top-0 bottom-0 w-0.5"
          :style="{ backgroundColor: colorWithOpacity(site.primaryColor, 0.2) }"
        />

        <div class="space-y-8">
          <div
            v-for="(milestone, idx) in milestones"
            :key="milestone.year"
            class="flex gap-6 items-start"
          >
            <!-- Year circle -->
            <div
              class="relative z-10 w-16 h-16 rounded-full bg-white border-2 flex items-center justify-center shrink-0 text-sm font-bold"
              :style="idx === milestones.length - 1
                ? { borderColor: site.primaryColor, color: site.primaryColor }
                : { borderColor: colorWithOpacity(site.primaryColor, 0.35), color: colorWithOpacity(site.primaryColor, 0.55) }"
            >
              {{ milestone.year }}
            </div>

            <!-- Content -->
            <div class="flex-1 pt-3 pb-2">
              <h3 class="font-bold text-gray-900 mb-1">{{ milestone.title }}</h3>
              <p class="text-gray-500 text-sm leading-relaxed">{{ milestone.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
