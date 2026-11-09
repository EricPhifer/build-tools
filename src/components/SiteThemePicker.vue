<script setup lang="ts">
import { useCompositionStore } from '../stores/composition'
import { SITE_THEMES } from '../types/registry'

// The website's color theme (light only / light + dark / dark only)
defineProps<{ compact?: boolean }>()

const composition = useCompositionStore()
</script>

<template>
  <div role="radiogroup" aria-label="Site theme" class="flex rounded-lg overflow-hidden border" :style="{ borderColor: 'var(--theme-border)' }">
    <button
      v-for="t in SITE_THEMES"
      :key="t.id"
      type="button"
      role="radio"
      :aria-checked="composition.composition.siteTheme === t.id"
      :title="t.description"
      class="flex-1 font-medium transition-colors"
      :class="compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-2 text-sm'"
      :style="composition.composition.siteTheme === t.id
        ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }
        : { color: 'var(--theme-text-secondary)' }"
      @click="composition.setSiteTheme(t.id)"
    >{{ t.label }}</button>
  </div>
</template>
