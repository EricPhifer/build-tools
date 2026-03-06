<script setup lang="ts">
import { useSiteContext } from '../../../composables/useSiteContext'

withDefaults(defineProps<{
  heading?: string
  stats?: Array<{ value: string; label: string; prefix?: string; suffix?: string }>
}>(), {
  heading: undefined,
  stats: () => [
    { value: '12', suffix: '+', label: 'Years in Business' },
    { value: '500', suffix: '+', label: 'Clients Served' },
    { value: '98', suffix: '%', label: 'Satisfaction Rate' },
    { value: '50', suffix: 'M+', label: 'Revenue Generated' },
  ]
})

const site = useSiteContext()
</script>

<template>
  <section
    class="py-14 px-6 text-white"
    :style="{ backgroundColor: site.primaryColor }"
  >
    <div class="max-w-5xl mx-auto">
      <h2 v-if="heading" class="text-center text-2xl font-bold mb-10">{{ heading }}</h2>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div v-for="stat in stats" :key="stat.label">
          <p class="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">
            <span v-if="stat.prefix">{{ stat.prefix }}</span>{{ stat.value }}<span v-if="stat.suffix" class="text-2xl md:text-3xl">{{ stat.suffix }}</span>
          </p>
          <p class="text-white/70 text-sm font-medium uppercase tracking-wide">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
