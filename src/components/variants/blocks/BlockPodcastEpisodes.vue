<script setup lang="ts">
import { Play } from 'lucide-vue-next'

const featured = {
  title: 'Episode 12 — Building Resilience in Hard Seasons',
  episodeNumber: 12
}
const episodes = [
  { episodeNumber: 11, title: 'The Power of Community', date: 'Mar 2026' },
  { episodeNumber: 10, title: 'Conversations on Hope', date: 'Feb 2026' },
  { episodeNumber: 9, title: 'When Faith Meets Action', date: 'Feb 2026' },
  { episodeNumber: 8, title: 'Stories from the Frontline', date: 'Jan 2026' },
  { episodeNumber: 7, title: 'Mentorship That Matters', date: 'Jan 2026' },
  { episodeNumber: 6, title: 'Voices of Recovery', date: 'Dec 2025' }
]
const platforms = [
  { name: 'Spotify', class: 'bg-green-600' },
  { name: 'Apple', class: 'bg-gray-800' },
  { name: 'Amazon', class: 'bg-orange-500' }
]
</script>

<template>
  <section class="py-16 px-6 bg-white">
    <div class="max-w-6xl mx-auto">
      <!-- Featured -->
      <div class="relative rounded-2xl overflow-hidden mb-12 shadow-lg">
        <div class="aspect-video bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
          <div class="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center">
            <Play class="w-10 h-10 text-white fill-white ml-1" />
          </div>
        </div>
        <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <p class="text-white/80 text-xs uppercase tracking-wide mb-1">Featured · Ep. {{ featured.episodeNumber }}</p>
          <h2 class="text-white text-2xl font-bold mb-3">{{ featured.title }}</h2>
          <div class="flex gap-2">
            <span v-for="p in platforms" :key="p.name" :class="`text-xs text-white px-3 py-1 rounded-full ${p.class}`">{{ p.name }}</span>
          </div>
        </div>
      </div>

      <!-- Episode grid -->
      <h3 class="text-xl font-bold mb-6" :style="{ color: 'var(--color-primary)' }">All Episodes</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="ep in episodes" :key="ep.episodeNumber" class="group cursor-pointer">
          <div class="relative aspect-video rounded-lg bg-gray-200 overflow-hidden mb-3">
            <span class="absolute top-2 right-2 text-xs px-2 py-0.5 rounded bg-black/60 text-white">Ep. {{ ep.episodeNumber }}</span>
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
              <Play class="w-10 h-10 text-white fill-white" />
            </div>
          </div>
          <h4 class="text-base font-semibold text-gray-900 line-clamp-2 mb-1">{{ ep.title }}</h4>
          <p class="text-xs text-gray-500">{{ ep.date }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
