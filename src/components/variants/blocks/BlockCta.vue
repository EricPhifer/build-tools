<script setup lang="ts">
import { useSiteContext } from '../../../composables/useSiteContext'

withDefaults(defineProps<{
  headline?: string
  text?: string
  buttonLabel?: string
  buttonUrl?: string
}>(), {
  headline: 'Ready to get started?',
  text: 'Contact us today to discuss your project and see how we can help.',
  buttonLabel: 'Contact Us',
  buttonUrl: '#'
})

const site = useSiteContext()
</script>

<template>
  <section class="py-16 px-6 bg-gray-900 text-white">
    <div class="max-w-3xl mx-auto text-center">
      <h2 class="text-3xl font-bold mb-4">{{ headline }}</h2>
      <p class="text-gray-300 text-lg mb-8">{{ text }}</p>
      <a
        :href="buttonUrl"
        class="inline-block text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        :style="{ backgroundColor: site.primaryColor }"
      >
        {{ buttonLabel }}
      </a>
    </div>
  </section>
</template>
