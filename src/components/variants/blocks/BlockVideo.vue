<script setup lang="ts">
import { useSiteContext } from '../../../composables/useSiteContext'

withDefaults(defineProps<{
  heading?: string
  subheading?: string
  caption?: string
}>(), {
  heading: 'See It In Action',
  subheading: 'Watch how our approach delivers real results for businesses like yours.',
  caption: 'Company Overview · 3 min'
})

const site = useSiteContext()
</script>

<template>
  <section class="py-16 px-6 bg-white">
    <div class="max-w-3xl mx-auto text-center">
      <h2 class="text-3xl font-bold text-gray-900 mb-3">{{ heading }}</h2>
      <p class="text-gray-500 text-base mb-8 max-w-xl mx-auto">{{ subheading }}</p>

      <!-- Video placeholder -->
      <div class="relative rounded-2xl overflow-hidden shadow-xl bg-gray-900 aspect-video flex items-center justify-center cursor-pointer group">
        <!-- Thumbnail gradient using brand colors -->
        <div
          class="absolute inset-0 opacity-85"
          :style="{ background: `linear-gradient(135deg, ${site.primaryColor}ee, ${site.secondaryColor}cc)` }"
        />

        <!-- Play button -->
        <div class="relative z-10 w-20 h-20 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors">
          <div class="w-0 h-0 border-t-10 border-t-transparent border-l-18 border-l-white border-b-10 border-b-transparent ml-1" />
        </div>

        <!-- Caption overlay -->
        <div class="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <span class="text-white/70 text-xs">{{ caption }}</span>
          <span class="text-white/70 text-xs bg-black/30 px-2 py-0.5 rounded">▶ Play</span>
        </div>
      </div>
    </div>
  </section>
</template>
