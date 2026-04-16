<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRegistryStore } from '../stores/registry'
import { useCompositionStore } from '../stores/composition'
import { useWorkflowStore } from '../stores/workflow'
import type { ComponentVariant } from '../types/registry'
import { Check, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const returnTo = computed(() => (route.query.returnTo as string) || '/site')
const registry = useRegistryStore()
const composition = useCompositionStore()
const workflow = useWorkflowStore()

const variants = computed(() => registry.getVariantsBySection('header'))
const selectedVariant = ref<ComponentVariant | null>(null)

const client = computed(() => workflow.clientInfo)

const navLinks = computed(() => {
  const pages = composition.siteBuilder.sitemapPages.filter(p => p.nav === 'primary').map(p => p.name)
  return pages.length > 0 ? pages : ['Home', 'About', 'Services', 'Contact']
})

// ── iframe preview state ──────────────────────────────────────────────────────
const previewWidth = ref<'mobile' | 'tablet' | 'desktop'>('desktop')
const iframeHeight = ref(280)

const widthMap = { mobile: '390px', tablet: '1024px', desktop: '100%' }

const iframeSrc = computed(() => {
  if (!selectedVariant.value) return ''
  const brandColors = client.value?.brandKit?.colors
  const params = new URLSearchParams({
    id: selectedVariant.value.id,
    siteName: client.value?.name ?? 'Your Business',
    navLinks: navLinks.value.join(','),
    authEnabled: String(composition.composition.headerAuthEnabled),
    darkModeEnabled: String(composition.composition.headerDarkModeEnabled),
    headingFont: client.value?.brandKit?.fonts?.find(f => f.category === 'heading')?.name ?? '',
    bodyFont: client.value?.brandKit?.fonts?.find(f => f.category === 'body')?.name ?? '',
    ...(brandColors?.light ? { colorsLight: JSON.stringify(brandColors.light) } : {}),
    ...(brandColors?.dark  ? { colorsDark:  JSON.stringify(brandColors.dark)  } : {}),
    ...(client.value?.brandKit?.borderRadius ? { borderRadius: client.value.brandKit.borderRadius } : {})
  })
  return `/preview/header?${params}`
})

function onMessage(e: MessageEvent) {
  if (e.data?.type === 'preview-height') {
    iframeHeight.value = e.data.height + 16
  }
}
onMounted(() => window.addEventListener('message', onMessage))
onUnmounted(() => window.removeEventListener('message', onMessage))

// Reset height when variant changes so there's no stale sizing
function selectVariant(variant: ComponentVariant) {
  if (selectedVariant.value?.id === variant.id) {
    selectedVariant.value = null
  } else {
    iframeHeight.value = 280
    previewWidth.value = 'desktop'
    selectedVariant.value = variant
  }
}

const selectForProject = (id: string) => {
  if (composition.composition.header === id) {
    composition.setHeader(null)
  } else {
    composition.setHeader(id)
  }
}

const widthPresets = [
  {
    key: 'mobile' as const,
    label: 'Mobile',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>`
  },
  {
    key: 'tablet' as const,
    label: 'Tablet',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>`
  },
  {
    key: 'desktop' as const,
    label: 'Desktop',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>`
  }
]
</script>

<template>
  <div class="p-6 lg:p-8 max-w-7xl">
    <!-- Back -->
    <button
      @click="router.push(returnTo)"
      class="flex items-center gap-1.5 text-sm mb-6 transition-colors"
      :style="{ color: 'var(--theme-text-secondary)' }"
    >
      <ArrowLeft class="w-4 h-4" />
      {{ returnTo === '/site' ? 'Back to Site Builder' : 'Back' }}
    </button>

    <div class="mb-8">
      <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">Header Variants</h1>
      <p class="mt-1" :style="{ color: 'var(--theme-text-secondary)' }">Browse and preview available header components for client sites.</p>
    </div>

    <!-- Variant Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
      <div
        v-for="variant in variants"
        :key="variant.id"
        class="rounded-xl border overflow-hidden transition-all duration-200"
        :class="composition.composition.header === variant.id ? 'ring-2 shadow-md' : ''"
        :style="{
          backgroundColor: 'var(--theme-bg-card)',
          borderColor: composition.composition.header === variant.id ? 'var(--theme-primary)' : 'var(--theme-border)',
          '--tw-ring-color': 'var(--theme-primary)'
        }"
      >
        <button @click="selectVariant(variant)" class="w-full p-5 text-left">
          <div class="flex items-start justify-between mb-1">
            <h3 class="font-semibold" :style="{ color: 'var(--theme-text-primary)' }">{{ variant.name }}</h3>
            <div
              v-if="composition.composition.header === variant.id"
              class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
            >
              <Check class="w-3 h-3" />
            </div>
          </div>
          <p class="text-sm mb-3" :style="{ color: 'var(--theme-text-secondary)' }">{{ variant.description }}</p>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="tag in variant.tags"
              :key="tag"
              class="text-xs px-2 py-0.5 rounded-full"
              :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
            >{{ tag }}</span>
          </div>
        </button>
        <div class="px-5 pb-4">
          <button
            @click="selectForProject(variant.id)"
            class="w-full text-sm py-2 rounded-lg font-medium transition-colors"
            :style="composition.composition.header === variant.id
              ? { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-secondary)' }
              : { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
          >
            {{ composition.composition.header === variant.id ? 'Deselect' : 'Select for Project' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Preview Area -->
    <div
      v-if="selectedVariant"
      class="rounded-xl border"
      :style="{ borderColor: 'var(--theme-border)' }"
    >
      <!-- Toolbar -->
      <div
        class="px-4 py-3 border-b flex items-center gap-3 rounded-t-xl overflow-hidden flex-wrap"
        :style="{ backgroundColor: 'var(--theme-bg-tertiary)', borderColor: 'var(--theme-border)' }"
      >
        <!-- Preview label -->
        <span class="font-medium text-sm shrink-0" :style="{ color: 'var(--theme-text-primary)' }">
          Preview: {{ selectedVariant.name }}
        </span>

        <!-- Device width presets -->
        <div
          class="flex items-center rounded-lg overflow-hidden border shrink-0"
          :style="{ borderColor: 'var(--theme-border)' }"
        >
          <button
            v-for="preset in widthPresets"
            :key="preset.key"
            @click="previewWidth = preset.key"
            class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-colors"
            :style="previewWidth === preset.key
              ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }
              : { color: 'var(--theme-text-secondary)' }"
            :aria-label="preset.label"
            :title="preset.label"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="preset.icon" />
            <span class="hidden sm:inline">{{ preset.label }}</span>
          </button>
        </div>

        <!-- Toggles -->
        <div class="flex items-center gap-4 ml-auto shrink-0">
          <!-- Auth toggle -->
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium" :style="{ color: 'var(--theme-text-secondary)' }">Login / Account</span>
            <button
              @click="composition.setHeaderAuthEnabled(!composition.composition.headerAuthEnabled)"
              class="relative w-9 h-5 rounded-full transition-colors shrink-0"
              :style="{ backgroundColor: composition.composition.headerAuthEnabled ? 'var(--theme-primary)' : 'var(--theme-bg-secondary)', border: '1px solid var(--theme-border)' }"
              :aria-label="`Auth ${composition.composition.headerAuthEnabled ? 'on' : 'off'}`"
            >
              <span
                class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
                :style="{ left: composition.composition.headerAuthEnabled ? 'calc(100% - 1.125rem)' : '1px' }"
              />
            </button>
          </div>
          <!-- Auth config (shown when Login enabled) -->
          <div v-if="composition.composition.headerAuthEnabled" class="flex items-center gap-3">
            <select
              :value="composition.siteBuilder.envConfig.auth0WhitelistStrategy"
              @change="composition.setEnvConfig({ auth0WhitelistStrategy: ($event.target as HTMLSelectElement).value as 'role' | 'appMetadata' })"
              class="text-xs px-2 py-1 rounded border"
              :style="{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }"
            >
              <option value="role">Role-based</option>
              <option value="appMetadata">App metadata</option>
            </select>
            <input
              :value="composition.siteBuilder.envConfig.auth0RoleName"
              @input="composition.setEnvConfig({ auth0RoleName: ($event.target as HTMLInputElement).value })"
              placeholder="Resident"
              class="text-xs px-2 py-1 rounded border w-24"
              :style="{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }"
              :title="'Role name — e.g. Resident, Member'"
            />
          </div>

          <!-- Dark mode toggle -->
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium" :style="{ color: 'var(--theme-text-secondary)' }">Dark Mode</span>
            <button
              @click="composition.setHeaderDarkModeEnabled(!composition.composition.headerDarkModeEnabled)"
              class="relative w-9 h-5 rounded-full transition-colors shrink-0"
              :style="{ backgroundColor: composition.composition.headerDarkModeEnabled ? 'var(--theme-primary)' : 'var(--theme-bg-secondary)', border: '1px solid var(--theme-border)' }"
              :aria-label="`Dark mode ${composition.composition.headerDarkModeEnabled ? 'on' : 'off'}`"
            >
              <span
                class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
                :style="{ left: composition.composition.headerDarkModeEnabled ? 'calc(100% - 1.125rem)' : '1px' }"
              />
            </button>
          </div>
        </div>

        <button
          @click="selectedVariant = null"
          class="text-sm px-3 py-1 rounded-lg transition-colors shrink-0"
          :style="{ color: 'var(--theme-text-secondary)' }"
        >Close</button>
      </div>

      <!-- iframe preview container -->
      <div class="bg-gray-100 rounded-b-xl overflow-hidden p-2">
        <div
          :style="{
            width: widthMap[previewWidth],
            margin: '0 auto',
            transition: 'width 0.3s ease',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: previewWidth !== 'desktop' ? '0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.08)' : 'none'
          }"
        >
          <iframe
            v-if="iframeSrc"
            :src="iframeSrc"
            :style="{ width: '100%', height: iframeHeight + 'px', border: 'none', display: 'block', backgroundColor: 'white' }"
            title="Header preview"
          />
        </div>
      </div>
    </div>
  </div>
</template>
