<script setup lang="ts">
withDefaults(defineProps<{
  features?: Array<{ title: string; description: string; icon: string }>
}>(), {
  features: () => [
    { title: 'Fast Performance', description: 'Optimized for speed with modern build tools and lazy loading.', icon: '⚡' },
    { title: 'Responsive Design', description: 'Looks great on every device, from phones to widescreen monitors.', icon: '📱' },
    { title: 'SEO Ready', description: 'Built with search engines in mind — semantic markup and fast load times.', icon: '🔍' }
  ]
})
</script>

<template>
  <section class="py-16 px-6 bg-white @container">
    <div class="max-w-5xl mx-auto">
      <div class="grid grid-cols-1 @md:grid-cols-3 gap-8">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="text-center p-6"
        >
          <div class="text-4xl mb-4">{{ feature.icon }}</div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ feature.title }}</h3>
          <p class="text-gray-600 text-sm">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
