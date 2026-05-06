<script setup lang="ts">
import { Heart, Menu, X, Plus } from 'lucide-vue-next'

withDefaults(defineProps<{
  siteName?: string
  logoUrl?: string
}>(), {
  siteName: 'The Joseph Center',
  logoUrl: ''
})

const navItems = [
  { label: 'HOME', children: null },
  { label: 'ABOUT', children: ['OUR STORY', 'BOARD', 'TESTIMONIALS'] },
  { label: 'PROGRAMS', children: ['DAY SHELTER', 'GOLDEN GIRLS', 'FAMILY CENTER'] },
  { label: 'FORMS', children: ['VOLUNTEER', 'REFERRAL'] },
  { label: 'CONTACT', children: null },
  { label: 'PARTNER WITH US', children: ['DONATE', 'EVENTS'] }
]

// In the preview, ABOUT is shown expanded to demonstrate accordion state
const expandedLabel = 'ABOUT'

const greenBg = 'var(--color-primary, #60B567)'
const goldText = 'var(--color-secondary, #CAA230)'
</script>

<template>
  <div class="rounded-xl overflow-hidden border" style="border-color: rgba(0,0,0,0.08)">
    <!-- Mocked hero strip with transparent header overlay -->
    <div class="relative" style="background: linear-gradient(135deg, #4a6e3a 0%, #6b8a52 100%); height: 64px;">
      <div class="absolute inset-0 px-4 flex items-center justify-between">
        <!-- Circular coin logo (with floating overlap) -->
        <div class="relative" style="margin-top: 20px;">
          <div
            class="rounded-full flex items-center justify-center shadow-md"
            :style="{ width: '52px', height: '52px', backgroundColor: greenBg, border: `3px solid ${goldText}` }"
          >
            <Heart class="w-5 h-5 text-white" fill="currentColor" />
          </div>
        </div>
        <div class="flex items-center gap-2.5">
          <a
            class="text-xs font-medium px-3 py-1 rounded-full"
            :style="{ border: `1.5px solid ${goldText}`, color: goldText, backgroundColor: 'transparent' }"
          >Volunteer</a>
          <Menu class="w-5 h-5" :style="{ color: goldText }" />
        </div>
      </div>
    </div>

    <!-- Compressed full-screen menu preview -->
    <div class="px-4 pt-3 pb-12 relative" :style="{ backgroundColor: greenBg }">
      <!-- Menu top bar (mirrors header) -->
      <div class="flex items-center justify-between mb-3">
        <div
          class="rounded-full flex items-center justify-center"
          :style="{ width: '36px', height: '36px', backgroundColor: greenBg, border: `2px solid ${goldText}` }"
        >
          <Heart class="w-3.5 h-3.5 text-white" fill="currentColor" />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-medium px-2.5 py-0.5 rounded-full" :style="{ border: `1.5px solid ${goldText}`, color: goldText }">Volunteer</span>
          <X class="w-4 h-4 text-white" />
        </div>
      </div>

      <!-- Nav items -->
      <nav class="space-y-0">
        <template v-for="item in navItems" :key="item.label">
          <div class="py-2 flex items-center justify-between" style="border-top: 1px solid rgba(255,255,255,0.35);">
            <span class="text-xs font-medium tracking-widest text-white">{{ item.label }}</span>
            <template v-if="item.children">
              <X v-if="expandedLabel === item.label" class="w-3.5 h-3.5 text-white" />
              <Plus v-else class="w-3.5 h-3.5 text-white" />
            </template>
          </div>
          <!-- Sub-items shown for the expanded section -->
          <div v-if="item.children && expandedLabel === item.label" class="pl-3 pb-2 space-y-1">
            <p
              v-for="child in item.children"
              :key="child"
              class="text-[10px] font-normal tracking-widest"
              style="color: rgba(255,255,255,0.85);"
            >{{ child }}</p>
          </div>
        </template>
        <div style="border-top: 1px solid rgba(255,255,255,0.35);"></div>
      </nav>

      <!-- Sticky donate (preview position) -->
      <div class="absolute right-3 bottom-3 flex items-center gap-1 text-white text-xs font-medium">
        <Heart class="w-3.5 h-3.5" />
        Donate
      </div>
    </div>
  </div>
</template>
