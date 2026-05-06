<script setup lang="ts">
import { Play } from 'lucide-vue-next'

const videos = [
  { name: 'Sarah Johnson', thumbnail: '' },
  { name: 'Michael Chen', thumbnail: '' },
  { name: 'Aisha Williams', thumbnail: '' },
  { name: 'David Martinez', thumbnail: '' }
]
</script>

<template>
  <section class="py-16 px-6 bg-white">
    <div class="max-w-5xl mx-auto">
      <h2 class="text-3xl font-bold text-center mb-12" :style="{ color: 'var(--color-primary)' }">Testimonies</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="v in videos"
          :key="v.name"
          class="group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
        >
          <div class="relative aspect-video bg-gray-200">
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center transition-transform group-hover:scale-110">
                <Play class="w-8 h-8 text-white fill-white ml-1" />
              </div>
            </div>
          </div>
          <div class="p-3 text-white text-center" :style="{ backgroundColor: 'var(--color-secondary, #d4a017)' }">
            {{ v.name }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
