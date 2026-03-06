<script setup lang="ts">
import { useSiteContext, colorWithOpacity } from '../../../composables/useSiteContext'

withDefaults(defineProps<{
  heading?: string
  subheading?: string
  posts?: Array<{ category: string; date: string; title: string; excerpt: string }>
}>(), {
  heading: 'Latest News & Insights',
  subheading: 'Stay up to date with tips, news, and ideas from our team.',
  posts: () => [
    { category: 'Strategy', date: 'Mar 2025', title: '5 Ways to Accelerate Business Growth This Year', excerpt: 'Practical strategies that high-growth companies are using right now to stay ahead of the competition and delight their customers.' },
    { category: 'Technology', date: 'Feb 2025', title: 'Why Your Website Is Your Most Valuable Sales Tool', excerpt: 'Your website works 24/7 so you don\'t have to. Here\'s how to make sure it\'s doing the heavy lifting for your business.' },
    { category: 'Operations', date: 'Jan 2025', title: 'How to Build Systems That Scale Without Burning Out', excerpt: 'The founders who scale successfully all have one thing in common: they build systems early, before growth forces their hand.' },
  ]
})

const site = useSiteContext()
</script>

<template>
  <section class="py-16 px-6 bg-gray-50 @container">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-end justify-between mb-10 flex-wrap gap-4">
        <div>
          <h2 class="text-3xl font-bold text-gray-900 mb-1">{{ heading }}</h2>
          <p class="text-gray-500 text-base">{{ subheading }}</p>
        </div>
        <a href="#" class="text-sm font-medium whitespace-nowrap" :style="{ color: site.primaryColor }">View all posts →</a>
      </div>

      <div class="grid grid-cols-1 @md:grid-cols-3 gap-6">
        <article
          v-for="post in posts"
          :key="post.title"
          class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col"
        >
          <!-- Placeholder image -->
          <div
            class="h-40 flex items-center justify-center"
            :style="{ background: `linear-gradient(135deg, ${colorWithOpacity(site.primaryColor, 0.08)}, ${colorWithOpacity(site.secondaryColor, 0.14)})` }"
          >
            <span class="text-3xl">📰</span>
          </div>

          <div class="p-5 flex flex-col flex-1">
            <div class="flex items-center gap-2 mb-3">
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full"
                :style="{ color: site.accentColor, backgroundColor: colorWithOpacity(site.accentColor, 0.1) }"
              >{{ post.category }}</span>
              <span class="text-xs text-gray-400">{{ post.date }}</span>
            </div>
            <h3 class="font-bold text-gray-900 mb-2 text-base leading-snug">{{ post.title }}</h3>
            <p class="text-gray-500 text-sm leading-relaxed flex-1">{{ post.excerpt }}</p>
            <a href="#" class="mt-4 text-sm font-medium" :style="{ color: site.primaryColor }">Read more →</a>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
