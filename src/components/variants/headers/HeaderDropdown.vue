<script setup lang="ts">
import { ref } from 'vue'
import AuthSlot from './AuthSlot.vue'
import DarkModeSlot from './DarkModeSlot.vue'

defineProps<{
  siteName?: string
  ctaLabel?: string
  ctaUrl?: string
  authEnabled?: boolean
  darkModeEnabled?: boolean
}>()

const openMenu = ref<string | null>(null)
const mobileOpen = ref(false)
const mobileExpanded = ref<string | null>(null)

const navItems = [
  { label: 'Services', children: ['Web Design', 'Development', 'SEO', 'Hosting'] },
  { label: 'About', children: [] },
  { label: 'Portfolio', children: [] },
  { label: 'Resources', children: ['Blog', 'Case Studies', 'FAQ'] },
  { label: 'Contact', children: [] }
]

function toggleMobileSection(label: string) {
  mobileExpanded.value = mobileExpanded.value === label ? null : label
}
</script>

<template>
  <header class="bg-white border-b border-gray-200 relative z-50">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
      <h1 class="text-xl font-bold text-gray-900 shrink-0">{{ siteName || 'Site Name' }}</h1>

      <!-- Desktop nav with dropdowns -->
      <nav class="hidden md:flex items-center gap-1 flex-1">
        <div
          v-for="item in navItems"
          :key="item.label"
          class="relative"
          @mouseenter="item.children.length ? openMenu = item.label : null"
          @mouseleave="openMenu = null"
        >
          <button
            class="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            @click="item.children.length ? (openMenu = openMenu === item.label ? null : item.label) : null"
          >
            {{ item.label }}
            <svg v-if="item.children.length" class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div
            v-if="item.children.length && openMenu === item.label"
            class="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50"
          >
            <a
              v-for="child in item.children"
              :key="child"
              href="#"
              class="block px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >{{ child }}</a>
          </div>
        </div>
      </nav>

      <!-- Desktop CTA + Auth -->
      <div class="hidden md:flex items-center gap-2 shrink-0">
        <DarkModeSlot v-if="darkModeEnabled" />
        <AuthSlot v-if="authEnabled" />
        <a :href="ctaUrl || '#'" class="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
          {{ ctaLabel || 'Get Started' }}
        </a>
      </div>

      <!-- Mobile hamburger -->
      <button class="md:hidden p-2 text-gray-600" @click="mobileOpen = !mobileOpen" :aria-expanded="mobileOpen">
        <svg v-if="!mobileOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Mobile menu with expandable sub-sections -->
    <div v-if="mobileOpen" class="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
      <nav class="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1">
        <template v-for="item in navItems" :key="item.label">
          <!-- Item with children: expandable -->
          <div v-if="item.children.length">
            <button
              class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              @click="toggleMobileSection(item.label)"
            >
              {{ item.label }}
              <svg class="w-4 h-4 text-gray-400 transition-transform" :class="mobileExpanded === item.label ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <div v-if="mobileExpanded === item.label" class="ml-4 mt-1 flex flex-col gap-1">
              <a
                v-for="child in item.children"
                :key="child"
                href="#"
                class="px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                @click="mobileOpen = false"
              >{{ child }}</a>
            </div>
          </div>
          <!-- Plain item -->
          <a
            v-else
            href="#"
            class="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            @click="mobileOpen = false"
          >{{ item.label }}</a>
        </template>
        <div class="pt-3 border-t border-gray-100 mt-2 flex flex-col gap-2">
          <DarkModeSlot v-if="darkModeEnabled" :full-width="true" />
          <AuthSlot v-if="authEnabled" :full-width="true" />
          <a :href="ctaUrl || '#'" class="flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold">
            {{ ctaLabel || 'Get Started' }}
          </a>
        </div>
      </nav>
    </div>
    <div v-if="mobileOpen" class="fixed inset-0 z-40" @click="mobileOpen = false" />
  </header>
</template>
