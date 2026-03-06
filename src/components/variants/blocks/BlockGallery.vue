<script setup lang="ts">
withDefaults(defineProps<{
  images?: Array<{ src: string; alt: string; caption?: string }>
}>(), {
  images: () => [
    { src: '', alt: 'Project 1', caption: 'Website Redesign' },
    { src: '', alt: 'Project 2', caption: 'Brand Identity' },
    { src: '', alt: 'Project 3', caption: 'E-Commerce Platform' },
    { src: '', alt: 'Project 4', caption: 'Mobile Application' },
    { src: '', alt: 'Project 5', caption: 'Dashboard Design' },
    { src: '', alt: 'Project 6', caption: 'Marketing Site' }
  ]
})
</script>

<template>
  <section class="py-12 px-6 bg-white @container">
    <div class="max-w-5xl mx-auto">
      <div class="grid grid-cols-2 @md:grid-cols-3 gap-4">
        <div
          v-for="(image, i) in images"
          :key="i"
          class="group relative overflow-hidden rounded-lg"
        >
          <div class="aspect-[4/3] bg-gray-200 flex items-center justify-center">
            <img
              v-if="image.src"
              :src="image.src"
              :alt="image.alt"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-gray-400 text-sm">{{ image.alt }}</span>
          </div>
          <div
            v-if="image.caption"
            class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2"
          >
            <p class="text-white text-sm font-medium">{{ image.caption }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
