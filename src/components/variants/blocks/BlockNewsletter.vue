<script setup lang="ts">
import { ref } from 'vue'
import { useSiteContext } from '../../../composables/useSiteContext'

withDefaults(defineProps<{
  heading?: string
  subheading?: string
  placeholder?: string
  ctaLabel?: string
}>(), {
  heading: 'Stay In the Loop',
  subheading: 'Get weekly insights, tips, and updates delivered straight to your inbox. No spam, ever.',
  placeholder: 'Enter your email address',
  ctaLabel: 'Subscribe'
})

const site = useSiteContext()
const email = ref('')
const submitted = ref(false)

function subscribe() {
  if (email.value) submitted.value = true
}
</script>

<template>
  <section
    class="py-16 px-6"
    :style="{ backgroundColor: site.primaryColor }"
  >
    <div class="max-w-xl mx-auto text-center">
      <h2 class="text-3xl font-bold text-white mb-3">{{ heading }}</h2>
      <p class="text-white/70 text-base mb-8">{{ subheading }}</p>

      <div v-if="!submitted" class="flex gap-2 max-w-md mx-auto">
        <input
          v-model="email"
          type="email"
          :placeholder="placeholder"
          class="flex-1 px-4 py-3 rounded-xl text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
          @keyup.enter="subscribe"
        />
        <button
          @click="subscribe"
          class="px-5 py-3 bg-white rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors shrink-0"
          :style="{ color: site.primaryColor }"
        >{{ ctaLabel }}</button>
      </div>

      <div v-else class="text-white/80 text-sm font-medium">
        ✓ You're subscribed — thanks for joining!
      </div>

      <p class="mt-4 text-white/50 text-xs">We respect your privacy. Unsubscribe at any time.</p>
    </div>
  </section>
</template>
