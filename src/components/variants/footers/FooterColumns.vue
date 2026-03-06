<script setup lang="ts">
defineProps<{
  copyrightText?: string
  columns?: Array<{ title: string; links: string[] }>
}>()

const defaultColumns = [
  { title: 'Company', links: ['About', 'Careers', 'Blog'] },
  { title: 'Support', links: ['Help Center', 'Contact', 'FAQ'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies'] }
]
</script>

<template>
  <footer class="bg-gray-900 text-gray-300">
    <div class="max-w-6xl mx-auto px-6 py-12">
      <div class="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
        <div v-for="col in (columns || defaultColumns)" :key="col.title">
          <h3 class="text-white font-semibold mb-3">{{ col.title }}</h3>
          <ul class="space-y-2">
            <li v-for="link in col.links" :key="link">
              <a href="#" class="text-sm hover:text-white transition-colors">{{ link }}</a>
            </li>
          </ul>
        </div>
      </div>
      <div class="border-t border-gray-700 pt-6 text-center">
        <p class="text-sm text-gray-500">&copy; {{ copyrightText || '2026 Company Name. All rights reserved.' }}</p>
      </div>
    </div>
  </footer>
</template>
