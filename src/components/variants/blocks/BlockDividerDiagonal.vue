<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  color?: 'gold' | 'green' | 'cream'
}>(), {
  title: 'Get Involved',
  color: 'gold'
})

const bg = computed(() => {
  if (props.color === 'green') return 'var(--color-primary)'
  if (props.color === 'cream') return 'var(--color-bg-secondary, #faf6ee)'
  return 'var(--color-secondary, #d4a017)'
})

const textColor = computed(() => props.color === 'cream' ? 'var(--color-text)' : '#ffffff')
const height = computed(() => props.title ? '120px' : '80px')
</script>

<template>
  <div
    class="relative w-full flex items-center justify-center"
    :style="{
      height,
      backgroundColor: bg,
      clipPath: 'polygon(0 15%, 100% 0, 100% 85%, 0 100%)'
    }"
  >
    <h2
      v-if="title"
      class="text-xl font-semibold uppercase tracking-wider"
      :style="{ color: textColor }"
    >{{ title }}</h2>
  </div>
</template>
