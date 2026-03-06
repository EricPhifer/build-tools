<script setup lang="ts">
import { useSiteContext } from '../../../composables/useSiteContext'

withDefaults(defineProps<{
  title?: string
  subtitle?: string
  ctaLabel?: string
  ctaUrl?: string
  imageUrl?: string
}>(), {
  title: 'Welcome to Our Website',
  subtitle: 'We build amazing experiences that help your business grow.',
  ctaLabel: 'Get Started',
  ctaUrl: '#'
})

const site = useSiteContext()
</script>

<template>
  <section
    class="relative text-white"
    :style="{ background: `linear-gradient(135deg, ${site.primaryColor}, ${site.secondaryColor})` }"
  >
    <div class="max-w-4xl mx-auto px-6 py-24 text-center">
      <h1 class="text-4xl md:text-5xl font-bold mb-4 leading-tight">{{ title }}</h1>
      <p class="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">{{ subtitle }}</p>
      <a
        :href="ctaUrl"
        class="inline-block bg-white font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors"
        :style="{ color: site.primaryColor }"
      >
        {{ ctaLabel }}
      </a>
    </div>
  </section>
</template>
