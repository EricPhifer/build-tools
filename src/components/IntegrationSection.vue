<script setup lang="ts">
import { computed, type Component } from 'vue'
import { Clock } from 'lucide-vue-next'
import { useCompositionStore } from '../stores/composition'

// One service on the Integrations step. "Set up later in Netlify" hides the
// fields: the variables stay on the Finalize env checklist and in the
// project's ENV-CHECKLIST.md, so nothing is lost by skipping them here.
const props = defineProps<{
  id: string
  title: string
  icon: Component
  /** The env vars this service needs, listed when it's set up later */
  vars: string[]
  badge?: string
}>()

const composition = useCompositionStore()
const later = computed(() => (composition.siteBuilder.integrationsLater ?? []).includes(props.id))
</script>

<template>
  <section class="p-5 rounded-xl border" :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }">
    <header class="flex flex-wrap items-center justify-between gap-2 mb-1">
      <div class="flex items-center gap-2">
        <component :is="icon" class="w-4 h-4" :style="{ color: 'var(--theme-primary)' }" />
        <h2 class="text-base font-semibold" :style="{ color: 'var(--theme-text-primary)' }">{{ title }}</h2>
        <span v-if="badge" class="text-xs px-2 py-0.5 rounded" :style="{ backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-muted)' }">{{ badge }}</span>
      </div>
      <label class="flex items-center gap-2 text-xs cursor-pointer select-none" :style="{ color: 'var(--theme-text-secondary)' }">
        <input
          type="checkbox"
          :checked="later"
          class="w-4 h-4 accent-current"
          :style="{ color: 'var(--theme-primary)' }"
          @change="composition.setIntegrationLater(id, ($event.target as HTMLInputElement).checked)"
        />
        Set up later in Netlify
      </label>
    </header>

    <div v-if="later" class="mt-3 flex gap-2 text-xs rounded-lg p-3" :style="{ backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-secondary)' }">
      <Clock class="w-4 h-4 shrink-0" />
      <p>
        To do in Netlify before launch:
        <span v-for="(v, i) in vars" :key="v"><span class="font-mono">{{ v }}</span><span v-if="i < vars.length - 1">, </span></span>.
        They're on the Finalize env checklist and in the project's ENV-CHECKLIST.md.
        <slot name="later" />
      </p>
    </div>
    <slot v-else />
  </section>
</template>
