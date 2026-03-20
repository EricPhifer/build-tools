<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, shallowRef, watch, type Component } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRegistryStore } from '../stores/registry'
import { useCompositionStore } from '../stores/composition'
import { useWorkflowStore } from '../stores/workflow'
import { ArrowLeft, ArrowUp, ArrowDown, Check, Layers, Lock } from 'lucide-vue-next'
import { SOCIAL_PLATFORM_LABELS } from '../types/registry'
import type { TemplateSlot } from '../types/registry'

const router = useRouter()
const route = useRoute()
const registry = useRegistryStore()
const composition = useCompositionStore()
const workflow = useWorkflowStore()

// ── Page resolution ───────────────────────────────────────────────────────────
const pageId = computed(() => route.params.pageId as string)

const currentPage = computed(() =>
  composition.siteBuilder.sitemapPages.find(p => p.id === pageId.value)
)

// ── Registry data ─────────────────────────────────────────────────────────────
const blocks = computed(() => registry.getBlocks())
const templates = computed(() => registry.getTemplates())

// Load all block components eagerly for thumbnail previews
const blockComponents = shallowRef<Record<string, Component>>({})

watch(blocks, async (allBlocks) => {
  const loaded: Record<string, Component> = {}
  for (const block of allBlocks) {
    const module = await block.component()
    loaded[block.id] = module.default
  }
  blockComponents.value = loaded
}, { immediate: true })

// ── Active template + slots ───────────────────────────────────────────────────
const activeTemplate = computed(() => {
  const tid = currentPage.value?.template ?? composition.composition.defaultTemplate
  return tid ? registry.getTemplateById(tid) : null
})

const templateSlots = computed<string[]>(() =>
  activeTemplate.value?.layout ?? ['content']
)

const selectedSlot = ref<string>('content')

// Reset selected slot if it's no longer valid for the active template
watch(activeTemplate, () => {
  if (!templateSlots.value.includes(selectedSlot.value)) {
    selectedSlot.value = templateSlots.value[0] ?? 'content'
  }
})

// ── Slot helpers ──────────────────────────────────────────────────────────────
// Column slots are narrow containers — full-width blocks warn when placed here
const COLUMN_SLOTS = new Set(['sidebar', 'right', 'col2', 'col3', 'secondary'])

function slotLabel(slot: string): string {
  const labels: Record<string, string> = {
    header: 'Header (Full-Width)',
    content: 'Content',
    sidebar: 'Sidebar',
    featured: 'Featured',
    right: 'Right',
    col2: 'Col 2',
    col3: 'Col 3',
    secondary: 'Secondary'
  }
  return labels[slot] ?? slot
}

function isColumnSlot(slot: string): boolean {
  return COLUMN_SLOTS.has(slot)
}

function isFullWidthBlock(blockId: string): boolean {
  return registry.getBlockById(blockId)?.fullWidthOnly === true
}

function getSlotBlocks(slot: string): string[] {
  const page = currentPage.value
  if (!page) return []
  if (slot === 'content') return page.blocks ?? []
  return page.slotBlocks?.[slot] ?? []
}

function setSlotBlocks(slot: string, ids: string[]) {
  if (slot === 'content') {
    composition.updateSitemapPage(pageId.value, { blocks: ids })
  } else {
    const page = currentPage.value
    if (!page) return
    composition.updateSitemapPage(pageId.value, {
      slotBlocks: { ...(page.slotBlocks ?? {}), [slot]: ids }
    })
  }
}

function isRequired(blockId: string): boolean {
  return (activeTemplate.value?.requiredBlocks?.[selectedSlot.value as TemplateSlot] ?? []).includes(blockId)
}

function isInCurrentSlot(blockId: string): boolean {
  return getSlotBlocks(selectedSlot.value).includes(blockId)
}

// ── Block management ──────────────────────────────────────────────────────────
function toggleBlock(blockId: string) {
  const current = getSlotBlocks(selectedSlot.value)
  if (current.includes(blockId)) {
    if (!isRequired(blockId)) setSlotBlocks(selectedSlot.value, current.filter(id => id !== blockId))
  } else {
    setSlotBlocks(selectedSlot.value, [...current, blockId])
  }
}

function removeBlock(blockId: string) {
  if (isRequired(blockId)) return
  setSlotBlocks(selectedSlot.value, getSlotBlocks(selectedSlot.value).filter(id => id !== blockId))
}

function moveBlockUp(index: number) {
  const arr = [...getSlotBlocks(selectedSlot.value)]
  if (index === 0) return
  const tmp1 = arr[index - 1]!; arr[index - 1] = arr[index]!; arr[index] = tmp1
  setSlotBlocks(selectedSlot.value, arr)
}

function moveBlockDown(index: number) {
  const arr = [...getSlotBlocks(selectedSlot.value)]
  if (index >= arr.length - 1) return
  const tmp2 = arr[index]!; arr[index] = arr[index + 1]!; arr[index + 1] = tmp2
  setSlotBlocks(selectedSlot.value, arr)
}

function setTemplate(value: string) {
  const page = currentPage.value
  if (!page) return
  composition.updateSitemapPage(pageId.value, { template: value || null })
  selectedSlot.value = 'content'

  if (!value) return
  const tmpl = registry.getTemplateById(value)
  if (!tmpl?.defaultBlocks) return

  const defaults = tmpl.defaultBlocks

  // Content slot defaults — merge, don't overwrite
  if (defaults.content?.length) {
    const existing = page.blocks ?? []
    const toAdd = defaults.content.filter(id => !existing.includes(id))
    if (toAdd.length) composition.updateSitemapPage(pageId.value, { blocks: [...existing, ...toAdd] })
  }

  // Other slot defaults
  const otherSlots = (Object.entries(defaults) as [string, string[]][]).filter(([k]) => k !== 'content')
  if (otherSlots.length) {
    const existing = page.slotBlocks ?? {}
    const additions: Record<string, string[]> = {}
    for (const [slot, defs] of otherSlots) {
      if (defs?.length) {
        const cur = existing[slot] ?? []
        const toAdd = defs.filter(id => !cur.includes(id))
        if (toAdd.length) additions[slot] = [...cur, ...toAdd]
      }
    }
    if (Object.keys(additions).length) {
      composition.updateSitemapPage(pageId.value, { slotBlocks: { ...existing, ...additions } })
    }
  }

  // Jump to first slot that has defaults
  const firstDefault = Object.keys(defaults)[0]
  // Wait a tick so templateSlots recomputes first
  setTimeout(() => {
    if (firstDefault && templateSlots.value.includes(firstDefault)) {
      selectedSlot.value = firstDefault
    }
  }, 0)
}

// ── iframe preview state ──────────────────────────────────────────────────────
const previewWidth = ref<'mobile' | 'tablet' | 'desktop'>('desktop')
const iframeHeight = ref(600)
const widthMap = { mobile: '390px', tablet: '768px', desktop: '100%' }

const siteName = computed(() => workflow.clientInfo?.name ?? 'Your Business')

const navLinks = computed(() => {
  const pages = composition.siteBuilder.sitemapPages
    .filter(p => p.nav === 'primary' || p.nav === 'both')
    .map(p => p.name)
  return pages.length > 0 ? pages : ['Home', 'About', 'Services', 'Contact']
})

const footerNavLinks = computed(() => {
  const pages = composition.siteBuilder.sitemapPages
    .filter(p => p.nav === 'footer' || p.nav === 'both')
    .map(p => p.name)
  return pages.length > 0 ? pages : ['Privacy Policy', 'Terms & Conditions', 'Accessibility']
})

const socialLinks = computed(() => {
  const sites = workflow.clientInfo?.connectedWebsites ?? []
  return sites
    .filter((s: { label: string }) => SOCIAL_PLATFORM_LABELS.has(s.label))
    .map((s: { label: string }) => s.label)
    .slice(0, 5)
})

const copyrightText = computed(() =>
  `${new Date().getFullYear()} ${siteName.value}. All rights reserved.`
)

const iframeSrc = computed(() => {
  const page = currentPage.value
  if (!page) return ''

  const sb = page.slotBlocks ?? {}
  const params = new URLSearchParams({
    headerId: composition.composition.header ?? '',
    footerId: composition.composition.footer ?? '',
    templateId: page.template ?? composition.composition.defaultTemplate ?? '',
    pageId: page.id,
    blockIds: (page.blocks ?? []).join(','),
    headerBlockIds:    (sb.header    ?? []).join(','),
    sidebarBlockIds:   (sb.sidebar   ?? []).join(','),
    featuredBlockIds:  (sb.featured  ?? []).join(','),
    rightBlockIds:     (sb.right     ?? []).join(','),
    col2BlockIds:      (sb.col2      ?? []).join(','),
    col3BlockIds:      (sb.col3      ?? []).join(','),
    secondaryBlockIds: (sb.secondary ?? []).join(','),
    siteName: siteName.value,
    navLinks: navLinks.value.join(','),
    footerNavLinks: footerNavLinks.value.join(','),
    socialLinks: socialLinks.value.join(','),
    copyrightText: copyrightText.value,
    authEnabled: String(composition.composition.headerAuthEnabled),
    darkModeEnabled: String(composition.composition.headerDarkModeEnabled),
    // Brand kit
    primaryColor: workflow.clientInfo?.brandKit?.colors?.primary ?? '#4f46e5',
    secondaryColor: workflow.clientInfo?.brandKit?.colors?.secondary ?? '#7c3aed',
    accentColor: workflow.clientInfo?.brandKit?.colors?.accent ?? '#0ea5e9',
    headingFont: workflow.clientInfo?.brandKit?.fonts?.find(f => f.category === 'heading')?.name ?? '',
    bodyFont: workflow.clientInfo?.brandKit?.fonts?.find(f => f.category === 'body')?.name ?? '',
    industry: workflow.clientInfo?.brandKit?.industry ?? '',
    whatTheyOffer: workflow.clientInfo?.brandKit?.whatTheyOffer ?? '',
    contactEmail: workflow.clientInfo?.contactEmail ?? '',
    domain: workflow.clientInfo?.domain ?? '',
    ...(workflow.clientInfo?.brandKit?.colors?.light
      ? { colorsLight: JSON.stringify(workflow.clientInfo.brandKit.colors.light) } : {}),
    ...(workflow.clientInfo?.brandKit?.colors?.dark
      ? { colorsDark: JSON.stringify(workflow.clientInfo.brandKit.colors.dark) } : {}),
    ...(workflow.clientInfo?.brandKit?.borderRadius
      ? { borderRadius: workflow.clientInfo.brandKit.borderRadius } : {})
  })
  return `/preview/page?${params}`
})

// Resolved template name for the toolbar badge
const activeTemplateName = computed(() => {
  const tid = currentPage.value?.template ?? composition.composition.defaultTemplate
  if (!tid) return null
  return registry.getTemplateById(tid)?.name ?? null
})

// ── postMessage height listener ───────────────────────────────────────────────
function onMessage(e: MessageEvent) {
  if (e.data?.type === 'preview-height') {
    iframeHeight.value = e.data.height + 16
  }
}
onMounted(() => window.addEventListener('message', onMessage))
onUnmounted(() => window.removeEventListener('message', onMessage))

// ── Width presets (same SVG icons as SiteHeaderView / SiteFooterView) ─────────
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

// Placeholder condition: show message when truly nothing to preview
const hasPreviewContent = computed(() =>
  !!(composition.composition.header || composition.composition.footer || currentPage.value?.blocks?.length)
)
</script>

<template>
  <div class="flex" style="min-height: calc(100vh - 0px);" :style="{ backgroundColor: 'var(--theme-bg-secondary)' }">

    <!-- ── LEFT PANEL ──────────────────────────────────────────────────────── -->
    <div
      class="w-85 shrink-0 border-r flex flex-col"
      style="height: 100vh; position: sticky; top: 0; overflow-y: auto;"
      :style="{
        backgroundColor: 'var(--theme-bg-card)',
        borderColor: 'var(--theme-border)'
      }"
    >
      <div class="p-5 flex flex-col gap-5">

        <!-- Back -->
        <button
          @click="router.push('/site/sitemap')"
          class="flex items-center gap-1.5 text-sm transition-colors self-start"
          :style="{ color: 'var(--theme-text-secondary)' }"
        >
          <ArrowLeft class="w-4 h-4" />
          Back to Sitemap
        </button>

        <!-- Page not found guard -->
        <div v-if="!currentPage" class="py-8 text-center">
          <p class="text-sm mb-3" :style="{ color: 'var(--theme-text-muted)' }">Page not found in sitemap.</p>
          <button
            @click="router.push('/site/sitemap')"
            class="text-sm underline"
            :style="{ color: 'var(--theme-primary)' }"
          >Return to Sitemap</button>
        </div>

        <template v-if="currentPage">
          <!-- Page identity -->
          <div>
            <h1 class="text-xl font-bold leading-tight" :style="{ color: 'var(--theme-text-primary)' }">
              {{ currentPage.name }}
            </h1>
            <span class="text-xs font-mono mt-0.5 block" :style="{ color: 'var(--theme-text-muted)' }">
              {{ currentPage.slug }}
            </span>
          </div>

          <!-- Template override -->
          <div>
            <label class="block text-xs font-semibold mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">
              Page Template
            </label>
            <select
              :value="currentPage.template ?? ''"
              @change="setTemplate(($event.target as HTMLSelectElement).value)"
              class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-1"
              :style="{
                backgroundColor: 'var(--theme-bg-secondary)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
                '--tw-ring-color': 'var(--theme-primary)'
              }"
            >
              <option value="">Default template</option>
              <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>

          <!-- Slot tabs (only when template has multiple slots) -->
          <div v-if="templateSlots.length > 1">
            <label class="block text-xs font-semibold mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">
              Active Slot
            </label>
            <div class="flex gap-1 flex-wrap">
              <button
                v-for="slot in templateSlots"
                :key="slot"
                @click="selectedSlot = slot"
                class="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                :style="selectedSlot === slot
                  ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }
                  : { backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-secondary)', border: '1px solid var(--theme-border)' }"
              >{{ slotLabel(slot) }}</button>
            </div>
          </div>

          <!-- Selected blocks ordered list -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-semibold" :style="{ color: 'var(--theme-text-secondary)' }">
                {{ templateSlots.length > 1 ? slotLabel(selectedSlot) + ' Blocks' : 'Selected Blocks' }}
              </label>
              <span
                v-if="getSlotBlocks(selectedSlot).length"
                class="text-xs px-1.5 py-0.5 rounded-full font-medium"
                :style="{ backgroundColor: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }"
              >{{ getSlotBlocks(selectedSlot).length }}</span>
            </div>

            <div
              v-if="!getSlotBlocks(selectedSlot).length"
              class="text-xs py-3 text-center rounded-lg border border-dashed"
              :style="{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }"
            >
              Choose blocks for the {{ slotLabel(selectedSlot) }} slot
            </div>

            <ol v-else class="space-y-1">
              <li
                v-for="(blockId, idx) in getSlotBlocks(selectedSlot)"
                :key="blockId"
                class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm"
                :style="{ backgroundColor: 'var(--theme-bg-secondary)' }"
              >
                <span
                  class="text-xs font-mono w-5 text-center shrink-0"
                  :style="{ color: 'var(--theme-text-muted)' }"
                >{{ idx + 1 }}</span>
                <span class="flex-1 truncate text-sm" :style="{ color: 'var(--theme-text-primary)' }">
                  {{ registry.getBlockById(blockId)?.name ?? blockId }}
                </span>
                <!-- Warning badge: full-width block in a narrow column slot -->
                <span
                  v-if="isFullWidthBlock(blockId) && isColumnSlot(selectedSlot)"
                  class="shrink-0 text-xs px-1.5 py-0.5 rounded font-medium"
                  style="background-color: #fef3c7; color: #92400e;"
                  title="This block is designed for full-width layouts. Consider moving it to the Header slot."
                >Full-width</span>
                <!-- Reorder buttons -->
                <div class="flex flex-col shrink-0">
                  <button
                    @click="moveBlockUp(idx)"
                    :disabled="idx === 0"
                    class="p-0.5 rounded transition-colors disabled:opacity-20"
                    :style="{ color: 'var(--theme-text-muted)' }"
                    title="Move up"
                  ><ArrowUp class="w-3 h-3" /></button>
                  <button
                    @click="moveBlockDown(idx)"
                    :disabled="idx === getSlotBlocks(selectedSlot).length - 1"
                    class="p-0.5 rounded transition-colors disabled:opacity-20"
                    :style="{ color: 'var(--theme-text-muted)' }"
                    title="Move down"
                  ><ArrowDown class="w-3 h-3" /></button>
                </div>
                <!-- Lock icon for required blocks, remove button otherwise -->
                <Lock
                  v-if="isRequired(blockId)"
                  class="shrink-0 w-3.5 h-3.5 opacity-40"
                  :style="{ color: 'var(--theme-text-muted)' }"
                  title="Required by this template"
                />
                <button
                  v-else
                  @click="removeBlock(blockId)"
                  class="shrink-0 w-5 h-5 flex items-center justify-center rounded transition-colors"
                  :style="{ color: 'var(--theme-text-muted)' }"
                  title="Remove block"
                >✕</button>
              </li>
            </ol>
          </div>

          <!-- Available blocks grid -->
          <div>
            <label class="block text-xs font-semibold mb-2" :style="{ color: 'var(--theme-text-secondary)' }">
              Available Blocks
            </label>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="block in blocks"
                :key="block.id"
                class="rounded-lg border overflow-hidden cursor-pointer transition-all duration-150"
                :class="isInCurrentSlot(block.id) ? 'ring-2 shadow-sm' : 'hover:shadow-sm'"
                :style="{
                  borderColor: isInCurrentSlot(block.id)
                    ? 'var(--theme-primary)'
                    : 'var(--theme-border)',
                  '--tw-ring-color': 'var(--theme-primary)',
                  backgroundColor: 'var(--theme-bg-card)'
                }"
                @click="toggleBlock(block.id)"
              >
                <!-- Scaled thumbnail -->
                <div class="relative overflow-hidden bg-white" style="height: 80px;">
                  <div class="origin-top-left" style="transform: scale(0.35); width: 286%; height: 286%;">
                    <Suspense>
                      <component :is="blockComponents[block.id]" v-if="blockComponents[block.id]" />
                      <template #fallback>
                        <div class="h-full bg-gray-100" />
                      </template>
                    </Suspense>
                  </div>
                  <!-- Click interceptor overlay -->
                  <div class="absolute inset-0" />
                  <!-- Selected checkmark -->
                  <div
                    v-if="isInCurrentSlot(block.id)"
                    class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow"
                    :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
                  >
                    <Check class="w-3 h-3" />
                  </div>
                  <!-- Lock badge for required blocks -->
                  <div
                    v-else-if="isRequired(block.id)"
                    class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow"
                    :style="{ backgroundColor: 'var(--theme-bg-card)', color: 'var(--theme-text-muted)' }"
                  >
                    <Lock class="w-2.5 h-2.5" />
                  </div>
                </div>
                <!-- Block name label -->
                <div
                  class="px-2 py-1.5 border-t text-xs font-medium truncate"
                  :style="{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }"
                >{{ block.name }}</div>
              </div>
            </div>
          </div>

        </template>
      </div>
    </div>

    <!-- ── RIGHT PANEL ─────────────────────────────────────────────────────── -->
    <div class="flex-1 flex flex-col min-w-0">

      <!-- Sticky toolbar -->
      <div
        class="sticky top-0 z-10 px-4 py-3 border-b flex items-center gap-3 flex-wrap shrink-0"
        :style="{
          backgroundColor: 'var(--theme-bg-tertiary)',
          borderColor: 'var(--theme-border)'
        }"
      >
        <!-- Label -->
        <span class="font-medium text-sm shrink-0" :style="{ color: 'var(--theme-text-primary)' }">
          Page Preview
        </span>

        <!-- Template badge -->
        <span
          v-if="activeTemplateName"
          class="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
          :style="{
            backgroundColor: 'var(--theme-bg-secondary)',
            color: 'var(--theme-text-secondary)',
            border: '1px solid var(--theme-border)'
          }"
        >
          <Layers class="w-3 h-3" />
          {{ activeTemplateName }}
        </span>

        <!-- Device width switcher -->
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

        <!-- Done -->
        <button
          @click="router.push('/site/sitemap')"
          class="ml-auto text-sm px-4 py-1.5 rounded-lg font-medium transition-colors shrink-0"
          :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
        >
          Done
        </button>
      </div>

      <!-- Preview area -->
      <div class="flex-1 bg-gray-100 p-3 overflow-auto">

        <!-- Placeholder -->
        <div
          v-if="!currentPage || !hasPreviewContent"
          class="h-full flex items-center justify-center min-h-96"
        >
          <div class="text-center py-16 px-8">
            <div
              class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              :style="{ backgroundColor: 'var(--theme-bg-card)' }"
            >
              <Layers class="w-8 h-8" :style="{ color: 'var(--theme-text-muted)' }" />
            </div>
            <p class="font-medium mb-1" :style="{ color: 'var(--theme-text-primary)' }">
              Nothing to preview yet
            </p>
            <p class="text-sm" :style="{ color: 'var(--theme-text-muted)' }">
              Select a header and footer in Global Layout, then add blocks here to see your page.
            </p>
          </div>
        </div>

        <!-- Live iframe -->
        <div
          v-else
          :style="{
            width: widthMap[previewWidth],
            margin: '0 auto',
            transition: 'width 0.3s ease',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: previewWidth !== 'desktop'
              ? '0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.08)'
              : 'none'
          }"
        >
          <iframe
            :src="iframeSrc"
            :style="{
              width: '100%',
              height: iframeHeight + 'px',
              border: 'none',
              display: 'block',
              backgroundColor: 'white'
            }"
            title="Page preview"
          />
        </div>

      </div>
    </div>

  </div>
</template>
