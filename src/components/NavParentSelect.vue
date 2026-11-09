<script setup lang="ts">
import { computed } from 'vue'
import type { SitemapPage } from '../types/registry'

// "Under": puts a main-menu page in another item's submenu (headers with
// submenus only). One level: a page with its own submenu can't move under another.
const props = defineProps<{ page: SitemapPage; pages: SitemapPage[] }>()

const inMain = (p: SitemapPage) => (p.nav === 'primary' || p.nav === 'both') && !p.isLegal
const hasChildren = computed(() => props.pages.some(p => p.navParent === props.page.id && inMain(p)))
const parents = computed(() =>
  props.pages.filter(p => p.id !== props.page.id && inMain(p) && !p.navParent && p.slug !== '/')
)
const shown = computed(() => inMain(props.page) && props.page.slug !== '/')

function set(value: string) {
  props.page.navParent = value || undefined
}
</script>

<template>
  <select
    v-if="shown"
    :value="page.navParent ?? ''"
    :disabled="hasChildren"
    :title="hasChildren ? 'Has its own submenu, so it stays at the top level' : 'Show this page in another menu item\'s submenu'"
    aria-label="Show in the submenu of"
    class="text-xs rounded-lg px-2 py-1.5 border shrink-0 focus:outline-none focus:ring-1 disabled:opacity-40 disabled:cursor-not-allowed"
    :style="{
      backgroundColor: 'var(--theme-bg-secondary)',
      borderColor: 'var(--theme-border)',
      color: 'var(--theme-text-primary)',
      '--tw-ring-color': 'var(--theme-primary)'
    }"
    @change="set(($event.target as HTMLSelectElement).value)"
  >
    <option value="">Top level</option>
    <option v-for="p in parents" :key="p.id" :value="p.id">Under {{ p.name }}</option>
  </select>
</template>
