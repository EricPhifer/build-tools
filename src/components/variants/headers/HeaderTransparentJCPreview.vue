<script setup lang="ts">
import { Heart, Plus } from 'lucide-vue-next'

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

const expandedLabel = 'ABOUT'

const green = 'var(--color-primary, #60B567)'
const darkGreen = 'var(--color-primary-hover, #2D6A4F)'
const gold = 'var(--color-secondary, #CAA230)'
const white = '#ffffff'
</script>

<template>
  <div class="rounded-xl overflow-hidden border" style="border-color: rgba(0,0,0,0.08)">
    <!-- Hero strip with absolute transparent header overlay + concentric coin overflowing top-left -->
    <div class="relative" style="background: linear-gradient(135deg, #4a6e3a 0%, #6b8a52 100%); height: 110px;">
      <!-- Coin (3 concentric rings) overflowing top-left -->
      <div class="absolute" style="top: -22px; left: -22px;">
        <div
          class="rounded-full flex items-center justify-center"
          :style="{ width: '78px', height: '78px', backgroundColor: gold }"
        >
          <div
            class="rounded-full flex items-center justify-center"
            :style="{ width: '64px', height: '64px', backgroundColor: darkGreen }"
          >
            <div
              class="rounded-full flex items-center justify-center"
              :style="{ width: '50px', height: '50px', backgroundColor: green }"
            >
              <Heart class="w-5 h-5 text-white" fill="currentColor" />
            </div>
          </div>
        </div>
      </div>

      <!-- Right-side actions -->
      <div class="absolute top-0 right-3 h-full flex items-center gap-2.5">
        <!-- Volunteer button (gold bg + white border + gold outline + white text) -->
        <span
          class="text-xs font-medium"
          :style="{
            backgroundColor: gold,
            color: white,
            border: `2px solid ${white}`,
            outline: `1px solid ${gold}`,
            padding: '4px 10px',
          }"
        >Volunteer</span>
        <!-- Hamburger (3 white bars) -->
        <div class="flex flex-col gap-1.5" style="width: 22px;">
          <span class="block h-0.5" :style="{ backgroundColor: white }"></span>
          <span class="block h-0.5" :style="{ backgroundColor: white }"></span>
          <span class="block h-0.5" :style="{ backgroundColor: white }"></span>
        </div>
      </div>
    </div>

    <!-- Compressed full-screen menu preview -->
    <div class="px-5 pt-4 pb-12 relative" :style="{ backgroundColor: green }">
      <!-- Menu top bar -->
      <div class="flex items-center justify-between mb-3">
        <div
          class="rounded-full flex items-center justify-center"
          :style="{ width: '40px', height: '40px', backgroundColor: gold }"
        >
          <div
            class="rounded-full flex items-center justify-center"
            :style="{ width: '32px', height: '32px', backgroundColor: darkGreen }"
          >
            <div
              class="rounded-full flex items-center justify-center"
              :style="{ width: '24px', height: '24px', backgroundColor: green }"
            >
              <Heart class="w-3 h-3 text-white" fill="currentColor" />
            </div>
          </div>
        </div>
        <span
          class="text-xs font-medium"
          :style="{
            backgroundColor: gold,
            color: white,
            border: `2px solid ${white}`,
            outline: `1px solid ${gold}`,
            padding: '3px 9px',
          }"
        >Volunteer</span>
      </div>

      <!-- Nav items -->
      <div>
        <template v-for="item in navItems" :key="item.label">
          <div class="py-2 flex items-center justify-between">
            <span class="text-xs font-medium tracking-widest text-white">{{ item.label }}</span>
            <Plus
              v-if="item.children"
              class="w-3.5 h-3.5 text-white transition-transform"
              :class="{ 'rotate-45': expandedLabel === item.label }"
            />
          </div>
          <hr style="border: none; border-top: 2px solid #ffffff; margin: 0;" />
          <div v-if="item.children && expandedLabel === item.label" class="pl-3 py-1">
            <p
              v-for="child in item.children"
              :key="child"
              class="text-[10px] font-normal tracking-widest py-1"
              style="color: rgba(255,255,255,0.92);"
            >{{ child }}</p>
          </div>
        </template>
      </div>

      <!-- Sticky donate -->
      <div class="absolute right-3 bottom-3 flex items-center gap-1 text-white text-xs font-medium">
        <Heart class="w-3.5 h-3.5" />
        Donate
      </div>
    </div>
  </div>
</template>
