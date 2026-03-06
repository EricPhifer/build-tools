<script setup lang="ts">
defineProps<{
  siteName?: string
  description?: string
  socialLinks?: string[]
  columns?: Array<{ title: string; links: string[] }>
  copyrightText?: string
}>()

const socialIcons: Record<string, string[]> = {
  twitter: ['M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z'],
  x: ['M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z'],
  facebook: ['M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z'],
  instagram: [
    'M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z',
    'M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z',
    'M17.5 6.5h.01'
  ],
  linkedin: [
    'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z',
    'M2 9h4v12H2z',
    'M4 6a2 2 0 100-4 2 2 0 000 4z'
  ],
  youtube: [
    'M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z',
    'M9.75 15.02L15.5 12l-5.75-3.02v6.04z'
  ],
  github: ['M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22'],
}

function getSocialPaths(platform: string): string[] {
  return socialIcons[platform.toLowerCase()] ?? ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71']
}

const defaultColumns = [
  { title: 'Services', links: ['Web Design', 'Development', 'SEO', 'Consulting'] },
  { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Press'] },
  { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookies'] }
]
</script>

<template>
  <footer class="bg-white border-t border-gray-200">
    <div class="max-w-6xl mx-auto px-6 py-12">
      <div class="grid md:grid-cols-4 gap-8 mb-10">

        <!-- Brand column -->
        <div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">{{ siteName || 'Your Brand' }}</h2>
          <p class="text-sm text-gray-500 leading-relaxed mb-5">
            {{ description || 'Building better digital experiences for businesses of all sizes.' }}
          </p>
          <div v-if="socialLinks?.length" class="flex gap-2 flex-wrap">
            <a
              v-for="platform in socialLinks"
              :key="platform"
              href="#"
              :aria-label="platform"
              :title="platform"
              class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                <path v-for="d in getSocialPaths(platform)" :key="d" stroke-linecap="round" stroke-linejoin="round" :d="d"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Link columns -->
        <div v-for="col in (columns || defaultColumns)" :key="col.title">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ col.title }}</h3>
          <ul class="space-y-2.5">
            <li v-for="link in col.links" :key="link">
              <a href="#" class="text-sm text-gray-500 hover:text-gray-800 transition-colors">{{ link }}</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="border-t border-gray-100 pt-6">
        <p class="text-sm text-gray-400">&copy; {{ copyrightText || '2026 Company Name. All rights reserved.' }}</p>
      </div>
    </div>
  </footer>
</template>
