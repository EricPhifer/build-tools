<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft, ArrowRight, Plus, Trash2, TriangleAlert, Globe, BookLock,
  ChevronRight, FlaskConical, Layers, Lock
} from 'lucide-vue-next'
import { useCompositionStore } from '../stores/composition'
import { useWorkflowStore } from '../stores/workflow'
import { getDefaultSitemapPages } from '../data/siteBuilderData'
import type { SitemapPage, NavAssignment } from '../types/registry'

const router      = useRouter()
const composition = useCompositionStore()
const workflow    = useWorkflowStore()

const isSnapshotPage = (id: string) =>
  workflow.extendMode && (workflow.extendSnapshot?.pageIds.includes(id) ?? false)

const pages = ref<SitemapPage[]>([])
onMounted(() => {
  if (composition.siteBuilder.sitemapPages.length > 0) {
    pages.value = composition.siteBuilder.sitemapPages.map(p => ({ ...p }))
  } else if (composition.siteBuilder.businessType) {
    pages.value = getDefaultSitemapPages(composition.siteBuilder.businessType)
  }
})

// Auto-sync local pages ref → store so the Page Builder can always find pages
watch(pages, () => {
  composition.setSitemapPages(pages.value)
}, { deep: true })

const newPageName = ref('')
const newPageSlug = ref('')
const addingPage = ref(false)

const regularPagesList = computed(() => pages.value.filter(p => !p.isLegal && !p.isEnrichOnly))
const legalPagesList = computed(() => pages.value.filter(p => p.isLegal))
const enrichPagesList = computed(() => pages.value.filter(p => p.isEnrichOnly))

const primaryPages = computed(() => pages.value.filter(p => p.nav === 'primary' || p.nav === 'both'))
const footerPages = computed(() => pages.value.filter(p => p.nav === 'footer' || p.nav === 'both'))
const hiddenPages = computed(() => pages.value.filter(p => p.nav === 'none'))

function setNav(id: string, nav: NavAssignment) {
  const page = pages.value.find(p => p.id === id)
  if (page) page.nav = nav
}

function toggleAuthRequired(id: string) {
  const page = pages.value.find(p => p.id === id)
  if (page) page.authRequired = !page.authRequired
}

function removePage(id: string) {
  pages.value = pages.value.filter(p => p.id !== id)
}

function slugify(name: string): string {
  return '/' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function handleNameInput() {
  newPageSlug.value = slugify(newPageName.value)
}

function addPage() {
  if (!newPageName.value.trim()) return
  const isEnrich = isEnrichPattern(newPageName.value)
  const page: SitemapPage = {
    id: crypto.randomUUID(),
    name: newPageName.value.trim(),
    slug: newPageSlug.value || slugify(newPageName.value.trim()),
    nav: 'primary',
    isCore: false,
    isLegal: false,
    isEnrichOnly: isEnrich,
    blocks: []
  }
  pages.value.push(page)
  newPageName.value = ''
  newPageSlug.value = ''
  addingPage.value = false
}

function isEnrichPattern(name: string): boolean {
  const lower = name.toLowerCase()
  return lower.includes('blog') || lower.includes('staff') || lower.includes('team') || lower.includes('event')
}

function save() {
  composition.setSitemapPages(pages.value)
  router.push('/site/checklist')
}

const NAV_OPTIONS: { value: NavAssignment; label: string }[] = [
  { value: 'primary', label: 'Primary Nav' },
  { value: 'footer', label: 'Footer Nav' },
  { value: 'both', label: 'Both' },
  { value: 'none', label: 'Neither' }
]
</script>

<template>
  <div class="p-6 lg:p-8 max-w-3xl">
    <!-- Back -->
    <button
      @click="router.push('/site/legal')"
      class="flex items-center gap-1.5 text-sm mb-6 transition-colors"
      :style="{ color: 'var(--theme-text-secondary)' }"
    >
      <ArrowLeft class="w-4 h-4" />
      Back to Legal Pages
    </button>

    <div class="mb-8">
      <div class="flex items-center gap-2 mb-1">
        <p class="text-xs font-semibold uppercase tracking-widest" :style="{ color: 'var(--theme-primary)' }">Step 2d</p>
        <span
          v-if="composition.siteBuilder.projectMode"
          class="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
          :style="{ backgroundColor: 'var(--theme-warning)', color: 'var(--theme-text-inverse)' }"
        >
          <FlaskConical class="w-3 h-3" />
          Project Mode
        </span>
      </div>
      <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">Sitemap</h1>
      <p class="mt-1" :style="{ color: 'var(--theme-text-secondary)' }">
        Review and adjust the pages for this site. Click the arrow on any row to open the Page Builder.
      </p>
    </div>

    <!-- ── Section: Content Pages ────────────────────────────────────────── -->
    <div class="space-y-2 mb-4">
      <div
        v-for="page in regularPagesList"
        :key="page.id"
        class="rounded-lg border overflow-hidden"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <div class="flex items-center gap-3 px-4 py-3">
          <!-- Lock icon for snapshot pages in extend mode; trash for non-core new pages -->
          <div
            v-if="isSnapshotPage(page.id)"
            class="shrink-0 p-1"
            :title="`Locked — from original build`"
            :style="{ color: 'var(--theme-warning)' }"
          ><Lock class="w-4 h-4" /></div>
          <button
            v-else-if="!page.isCore"
            @click="removePage(page.id)"
            class="shrink-0 p-1 rounded transition-colors"
            :style="{ color: 'var(--theme-text-muted)' }"
            title="Remove page"
          ><Trash2 class="w-4 h-4" /></button>
          <div v-else class="w-6 shrink-0" />
          <div class="shrink-0" :style="{ color: isSnapshotPage(page.id) ? 'var(--theme-text-muted)' : 'var(--theme-primary)' }">
            <Globe class="w-4 h-4" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-medium text-sm" :style="{ color: 'var(--theme-text-primary)' }">{{ page.name }}</span>
              <span
                v-if="page.isCore"
                class="text-xs px-1.5 py-0.5 rounded"
                :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
              >core</span>
              <span
                v-if="isSnapshotPage(page.id)"
                class="text-xs px-1.5 py-0.5 rounded"
                :style="{ backgroundColor: 'var(--theme-warning-light)', color: 'var(--theme-warning)' }"
              >original</span>
              <span
                v-if="page.blocks?.length"
                class="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                :style="{ backgroundColor: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }"
              ><Layers class="w-3 h-3" />{{ page.blocks.length }} block{{ page.blocks.length === 1 ? '' : 's' }}</span>
            </div>
            <span class="text-xs font-mono" :style="{ color: 'var(--theme-text-muted)' }">{{ page.slug }}</span>
          </div>
          <!-- Auth lock toggle (only when Login enabled, never on legal/home pages) -->
          <button
            v-if="!page.isLegal && page.slug !== '/'"
            @click="toggleAuthRequired(page.id)"
            class="shrink-0 p-1.5 rounded transition-colors"
            :style="{
              color: page.authRequired ? 'var(--theme-warning)' : 'var(--theme-text-muted)',
              backgroundColor: page.authRequired ? 'var(--theme-warning-light)' : 'transparent'
            }"
            :title="page.authRequired ? 'Members Only — click to make public' : 'Click to require login'"
          >
            <Lock class="w-3.5 h-3.5" />
          </button>
          <span
            v-if="page.authRequired"
            class="text-xs px-1.5 py-0.5 rounded shrink-0"
            :style="{ backgroundColor: 'var(--theme-warning-light)', color: 'var(--theme-warning)' }"
          >members only</span>
          <select
            :value="page.nav"
            :disabled="isSnapshotPage(page.id)"
            @change="setNav(page.id, ($event.target as HTMLSelectElement).value as NavAssignment)"
            class="text-xs rounded-lg px-2 py-1.5 border shrink-0 focus:outline-none focus:ring-1 disabled:opacity-40 disabled:cursor-not-allowed"
            :style="{
              backgroundColor: 'var(--theme-bg-secondary)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-text-primary)',
              '--tw-ring-color': 'var(--theme-primary)'
            }"
          >
            <option v-for="opt in NAV_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <button
            @click="router.push('/site/page/' + page.id)"
            class="shrink-0 p-1 rounded transition-colors"
            :style="{ color: isSnapshotPage(page.id) ? 'var(--theme-text-muted)' : 'var(--theme-primary)' }"
            :title="isSnapshotPage(page.id) ? 'View page (locked in extend mode)' : 'Open Page Builder'"
          ><ChevronRight class="w-4 h-4" /></button>
        </div>
      </div>
    </div>

    <!-- Add page -->
    <div class="mb-8">
      <div v-if="!addingPage">
        <button
          @click="addingPage = true"
          class="flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg border transition-colors"
          :style="{ borderColor: 'var(--theme-border)', color: 'var(--theme-primary)', backgroundColor: 'var(--theme-bg-card)' }"
        >
          <Plus class="w-4 h-4" />
          Add Page
        </button>
      </div>
      <div
        v-else
        class="p-4 rounded-xl border"
        :style="{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }"
      >
        <div class="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--theme-text-secondary)' }">Page Name</label>
            <input
              v-model="newPageName"
              @input="handleNameInput"
              type="text"
              placeholder="e.g. Blog"
              class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              :style="{
                backgroundColor: 'var(--theme-bg-secondary)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
                '--tw-ring-color': 'var(--theme-primary)'
              }"
            />
          </div>
          <div>
            <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--theme-text-secondary)' }">Slug</label>
            <input
              v-model="newPageSlug"
              type="text"
              placeholder="/blog"
              class="w-full px-3 py-2 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2"
              :style="{
                backgroundColor: 'var(--theme-bg-secondary)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
                '--tw-ring-color': 'var(--theme-primary)'
              }"
            />
          </div>
        </div>
        <p
          v-if="newPageName && isEnrichPattern(newPageName)"
          class="text-xs mb-3 flex items-start gap-1.5 p-2 rounded-lg"
          :style="{ backgroundColor: 'var(--theme-warning-light)', color: 'var(--theme-warning)' }"
        >
          <TriangleAlert class="w-3.5 h-3.5 mt-0.5 shrink-0" />
          This pattern typically requires Enrich — it will be flagged for scope planning.
        </p>
        <div class="flex gap-2">
          <button
            @click="addPage"
            :disabled="!newPageName.trim()"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
            :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
          >Add Page</button>
          <button
            @click="addingPage = false; newPageName = ''; newPageSlug = ''"
            class="px-4 py-2 rounded-lg text-sm transition-colors"
            :style="{ color: 'var(--theme-text-secondary)', backgroundColor: 'var(--theme-bg-secondary)' }"
          >Cancel</button>
        </div>
      </div>
    </div>

    <!-- ── Section: Legal Pages ────────────────────────────────────────────── -->
    <div v-if="legalPagesList.length" class="mb-8">
      <div class="flex items-center gap-2 mb-3">
        <BookLock class="w-4 h-4" :style="{ color: 'var(--theme-text-muted)' }" />
        <p class="text-xs font-semibold uppercase tracking-widest" :style="{ color: 'var(--theme-text-muted)' }">Legal Pages</p>
        <span class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">— click to add blocks using your selected template</span>
      </div>
      <div class="space-y-2">
        <div
          v-for="page in legalPagesList"
          :key="page.id"
          class="rounded-lg border overflow-hidden"
          :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border-light)' }"
        >
          <div class="flex items-center gap-3 px-4 py-3">
            <div class="w-6 shrink-0" />
            <div class="shrink-0" :style="{ color: 'var(--theme-text-muted)' }">
              <BookLock class="w-4 h-4" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-medium text-sm" :style="{ color: 'var(--theme-text-primary)' }">{{ page.name }}</span>
                <span
                  v-if="page.blocks?.length"
                  class="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                  :style="{ backgroundColor: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }"
                ><Layers class="w-3 h-3" />{{ page.blocks.length }} block{{ page.blocks.length === 1 ? '' : 's' }}</span>
              </div>
              <span class="text-xs font-mono" :style="{ color: 'var(--theme-text-muted)' }">{{ page.slug }}</span>
            </div>
            <select
              :value="page.nav"
              @change="setNav(page.id, ($event.target as HTMLSelectElement).value as NavAssignment)"
              class="text-xs rounded-lg px-2 py-1.5 border shrink-0 focus:outline-none focus:ring-1"
              :style="{
                backgroundColor: 'var(--theme-bg-secondary)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
                '--tw-ring-color': 'var(--theme-primary)'
              }"
            >
              <option v-for="opt in NAV_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
            <button
              @click="router.push('/site/page/' + page.id)"
              class="shrink-0 p-1 rounded transition-colors"
              :style="{ color: 'var(--theme-primary)' }"
              title="Open Page Builder"
            ><ChevronRight class="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Section: Enrich-Only Pages ─────────────────────────────────────── -->
    <div v-if="enrichPagesList.length" class="mb-8">
      <div class="flex items-center gap-2 mb-3">
        <FlaskConical class="w-4 h-4" :style="{ color: 'var(--theme-warning)' }" />
        <p class="text-xs font-semibold uppercase tracking-widest" :style="{ color: 'var(--theme-warning)' }">Enrich-Only</p>
        <span class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">— requires dynamic content, out of base scope</span>
      </div>
      <div class="space-y-2">
        <div
          v-for="page in enrichPagesList"
          :key="page.id"
          class="rounded-lg border overflow-hidden"
          :style="{ backgroundColor: 'var(--theme-warning-light)', borderColor: 'var(--theme-warning)' }"
        >
          <div class="flex items-center gap-3 px-4 py-3">
            <button
              v-if="!page.isCore"
              @click="removePage(page.id)"
              class="shrink-0 p-1 rounded transition-colors"
              :style="{ color: 'var(--theme-text-muted)' }"
              title="Remove page"
            ><Trash2 class="w-4 h-4" /></button>
            <div v-else class="w-6 shrink-0" />
            <div class="shrink-0" :style="{ color: 'var(--theme-warning)' }">
              <TriangleAlert class="w-4 h-4" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-medium text-sm" :style="{ color: 'var(--theme-text-primary)' }">{{ page.name }}</span>
                <span
                  v-if="page.blocks?.length"
                  class="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                  :style="{ backgroundColor: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }"
                ><Layers class="w-3 h-3" />{{ page.blocks.length }} block{{ page.blocks.length === 1 ? '' : 's' }}</span>
              </div>
              <span class="text-xs font-mono" :style="{ color: 'var(--theme-text-muted)' }">{{ page.slug }}</span>
            </div>
            <select
              :value="page.nav"
              @change="setNav(page.id, ($event.target as HTMLSelectElement).value as NavAssignment)"
              class="text-xs rounded-lg px-2 py-1.5 border shrink-0 focus:outline-none focus:ring-1"
              :style="{
                backgroundColor: 'var(--theme-bg-secondary)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
                '--tw-ring-color': 'var(--theme-primary)'
              }"
            >
              <option v-for="opt in NAV_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
            <button
              @click="router.push('/site/page/' + page.id)"
              class="shrink-0 p-1 rounded transition-colors"
              :style="{ color: 'var(--theme-primary)' }"
              title="Open Page Builder"
            ><ChevronRight class="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>

    <!-- Nav summary -->
    <div class="grid grid-cols-4 gap-3 mb-6 text-center">
      <div class="p-3 rounded-lg" :style="{ backgroundColor: 'var(--theme-bg-secondary)' }">
        <p class="text-lg font-bold" :style="{ color: 'var(--theme-text-primary)' }">{{ primaryPages.length }}</p>
        <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Primary Nav</p>
      </div>
      <div class="p-3 rounded-lg" :style="{ backgroundColor: 'var(--theme-bg-secondary)' }">
        <p class="text-lg font-bold" :style="{ color: 'var(--theme-text-primary)' }">{{ footerPages.length }}</p>
        <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Footer Nav</p>
      </div>
      <div class="p-3 rounded-lg" :style="{ backgroundColor: 'var(--theme-bg-secondary)' }">
        <p class="text-lg font-bold" :style="{ color: 'var(--theme-text-primary)' }">{{ pages.filter(p => p.nav === 'both').length }}</p>
        <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Both</p>
      </div>
      <div class="p-3 rounded-lg" :style="{ backgroundColor: 'var(--theme-bg-secondary)' }">
        <p class="text-lg font-bold" :style="{ color: 'var(--theme-text-primary)' }">{{ hiddenPages.length }}</p>
        <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Neither</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-between">
      <button
        @click="router.push('/site/legal')"
        class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors"
        :style="{ color: 'var(--theme-text-secondary)', backgroundColor: 'var(--theme-bg-secondary)' }"
      >
        <ArrowLeft class="w-4 h-4" />
        Back
      </button>
      <button
        :disabled="pages.length === 0"
        @click="save"
        class="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
      >
        Save & Continue
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
