<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  LayoutDashboard, Zap, BarChart3, BookOpen, Link2, FileEdit,
  ArrowRight, Plus, Trash2, Lock, ExternalLink, Monitor, Tablet, Smartphone, CreditCard,
  ClipboardList, GripVertical
} from 'lucide-vue-next'
import { useCompositionStore } from '../stores/composition'
import { useWorkflowStore } from '../stores/workflow'
import WorkflowProgress from '../components/WorkflowProgress.vue'
import type { DashboardWidgetType, TutorialVideo, HelpfulLink, QuickAction, ContentEditorWidget, ContentEditorField, ContentKitSectionConfig } from '../types/dashboard'
import { BRAND_PERSONALITY_OPTIONS } from '../types/dashboard'

const router = useRouter()
const composition = useCompositionStore()
const workflow = useWorkflowStore()

workflow.goToStep('dashboard')

const activeTab = ref<string>('widgets')
const iframeRef = ref<HTMLIFrameElement | null>(null)
const deviceWidth = ref<'mobile' | 'tablet' | 'desktop'>('desktop')
const widthMap = { mobile: '390px', tablet: '768px', desktop: '100%' }

const config = computed(() => composition.siteBuilder.dashboardConfig)
const client = computed(() => workflow.clientInfo)
const domain = computed(() =>
  composition.composition.name
    ? composition.composition.name.toLowerCase().replace(/\s+/g, '')
    : client.value?.domain ?? 'clientname'
)

// Sanity schema options from CMS step
const schemas = computed(() => composition.mergedSchemaRequirements)
function getSchemaFields(documentType: string) {
  return schemas.value.find(s => s.documentType === documentType)?.fields ?? []
}

// Emoji picker
const activeEmojiPicker = ref<string | null>(null)
const COMMON_EMOJIS = [
  '🔗', '📄', '📋', '📌', '📎', '🔧', '⚙️', '🛠️', '💡', '📚',
  '📖', '📝', '🎯', '🎓', '🏆', '✅', '⭐', '🌟', '🚀', '🔑',
  '💎', '🎨', '🎬', '📹', '🎥', '📸', '🗂️', '📊', '📈', '💻',
  '📱', '🖥️', '💾', '📡', '🔔', '📢', '✉️', '📧', '🏠', '🏢',
  '🌐', '💬', '❓', '❗', 'ℹ️', '⚠️', '🎁', '🎉', '💰', '💳',
  '📣', '🖨️', '🖱️', '💫', '🌍', '🤝', '👋', '✨', '🔍', '🗓️',
]
function selectEmoji(linkId: string, emoji: string) {
  updateLink(linkId, { emoji })
  activeEmojiPicker.value = null
}

const linksWereSeeded = ref(false)
const newRouteInput = ref('')

function seedInternalRoutes() {
  if (config.value.analyticsInternalRoutes.length > 0) return
  const defaults = ['/analytics', '/billing', '/content-kit', '/support']
  const sitemap = composition.siteBuilder.sitemapPages
  if (sitemap.some(p => p.slug === '/about-us')) {
    defaults.push('/about-us')
  }
  composition.setDashboardConfig({ analyticsInternalRoutes: defaults })
}

function addInternalRoute() {
  const route = newRouteInput.value.trim()
  if (!route) return
  const normalized = route.startsWith('/') ? route : `/${route}`
  if (config.value.analyticsInternalRoutes.includes(normalized)) {
    newRouteInput.value = ''
    return
  }
  composition.setDashboardConfig({
    analyticsInternalRoutes: [...config.value.analyticsInternalRoutes, normalized]
  })
  newRouteInput.value = ''
}

function removeInternalRoute(route: string) {
  composition.setDashboardConfig({
    analyticsInternalRoutes: config.value.analyticsInternalRoutes.filter(r => r !== route)
  })
}

onMounted(() => {
  if (config.value.quickActions.length === 0) {
    const siteUrl = composition.siteBuilder.envConfig.siteUrl || `https://${domain.value}.com`
    composition.setDashboardConfig({
      quickActions: [
        { id: 'live-site', label: 'View Live Site', url: siteUrl, icon: 'Globe', isBuiltIn: true },
        { id: 'studio', label: 'Open Studio', url: `https://studio.${domain.value}.com`, icon: 'PencilLine', isBuiltIn: true },
      ]
    })
  }

  // Seed helpful links from known project config if empty
  if (config.value.helpfulLinks.length === 0) {
    const seeds: HelpfulLink[] = []
    const siteUrl = composition.siteBuilder.envConfig.siteUrl
    const studioUrl = `https://studio.${domain.value}.com`
    const useGA = config.value.useGoogleAnalytics
    const saId = config.value.simpleAnalyticsId
    const gaId = config.value.analyticsId

    if (siteUrl) {
      seeds.push({ id: 'live-site', title: 'Live Site', url: siteUrl, description: 'View your published website', emoji: '🌐' })
    }
    if (studioUrl) {
      seeds.push({ id: 'studio', title: 'Sanity Studio', url: studioUrl, description: 'Edit your content', emoji: '✏️' })
    }
    if (!useGA && saId) {
      seeds.push({ id: 'analytics', title: 'Simple Analytics', url: `https://dashboard.simpleanalytics.com/${saId}`, description: 'View site traffic', emoji: '📊' })
    } else if (useGA && gaId) {
      seeds.push({ id: 'analytics', title: 'Google Analytics', url: `https://analytics.google.com/analytics/web/#/p${gaId}`, description: 'View site traffic', emoji: '📊' })
    }

    if (seeds.length > 0) {
      composition.setDashboardConfig({ helpfulLinks: seeds })
      linksWereSeeded.value = true
    }
  }

  // Seed internal routes for analytics filtering
  seedInternalRoutes()

  // Close emoji picker on outside click
  document.addEventListener('click', () => { activeEmojiPicker.value = null })
})

const iframeSrc = computed(() => {
  const logos = client.value?.brandKit?.logos
  const logoUrl = logos?.dark || logos?.primary || client.value?.brandKit?.logoUrl || ''
  const params = new URLSearchParams({
    domain: domain.value,
    primaryColor: client.value?.brandKit.colors.primary ?? '#6366f1',
    clientName: client.value?.name ?? 'Client Dashboard',
  })
  if (logoUrl) params.set('logoUrl', logoUrl)
  return `/preview/dashboard?${params}`
})

watch(config, () => {
  if (iframeRef.value) iframeRef.value.src = iframeSrc.value
}, { deep: true })

const ALL_WIDGETS: { id: DashboardWidgetType; label: string; description: string }[] = [
  { id: 'quickActions', label: 'Quick Actions', description: 'Shortcut buttons to live site, Studio, and other key URLs.' },
  { id: 'analytics', label: 'Site Analytics', description: 'Traffic overview widget — Simple Analytics by default, GA4 override available.' },
  { id: 'tutorials', label: 'Tutorial Videos', description: 'Embedded video library grouped by category.' },
  { id: 'links', label: 'Helpful Links', description: 'Curated resource cards with emoji, title, and description.' },
  { id: 'contentEditor', label: 'Content Editors', description: 'Simple forms for clients to update Sanity content and trigger rebuilds.' },
]

function isEnabled(id: DashboardWidgetType) {
  return config.value.enabledWidgets.includes(id)
}

function toggleWidget(id: DashboardWidgetType) {
  const enabled = [...config.value.enabledWidgets]
  const idx = enabled.indexOf(id)
  if (idx >= 0) enabled.splice(idx, 1)
  else enabled.push(id)
  composition.setDashboardConfig({ enabledWidgets: enabled })
}

// --- Quick Actions ---
function addAction() {
  composition.setDashboardConfig({
    quickActions: [...config.value.quickActions, { id: crypto.randomUUID(), label: '', url: '', icon: 'ExternalLink' }]
  })
}
function updateAction(id: string, partial: Partial<QuickAction>) {
  composition.setDashboardConfig({
    quickActions: config.value.quickActions.map(a => a.id === id ? { ...a, ...partial } : a)
  })
}
function removeAction(id: string) {
  const action = config.value.quickActions.find(a => a.id === id)
  if (action?.isBuiltIn) return
  composition.setDashboardConfig({ quickActions: config.value.quickActions.filter(a => a.id !== id) })
}

// --- Tutorial Videos ---
function addVideo() {
  composition.setDashboardConfig({
    tutorialVideos: [...config.value.tutorialVideos, { id: crypto.randomUUID(), source: 'youtube', title: '', url: '', muxPlaybackId: '', category: '', description: '' }]
  })
}
function updateVideo(id: string, partial: Partial<TutorialVideo>) {
  composition.setDashboardConfig({
    tutorialVideos: config.value.tutorialVideos.map(v => v.id === id ? { ...v, ...partial } : v)
  })
}
function removeVideo(id: string) {
  composition.setDashboardConfig({ tutorialVideos: config.value.tutorialVideos.filter(v => v.id !== id) })
}

// --- Helpful Links ---
function addLink() {
  composition.setDashboardConfig({
    helpfulLinks: [...config.value.helpfulLinks, { id: crypto.randomUUID(), title: '', url: '', description: '', emoji: '🔗' }]
  })
}
function updateLink(id: string, partial: Partial<HelpfulLink>) {
  composition.setDashboardConfig({
    helpfulLinks: config.value.helpfulLinks.map(l => l.id === id ? { ...l, ...partial } : l)
  })
}
function removeLink(id: string) {
  composition.setDashboardConfig({ helpfulLinks: config.value.helpfulLinks.filter(l => l.id !== id) })
}

// --- Content Editors ---
function addEditor() {
  composition.setDashboardConfig({
    contentEditors: [...config.value.contentEditors, { id: crypto.randomUUID(), label: '', documentType: '', description: '', fields: [] }]
  })
}
function updateEditor(id: string, partial: Partial<ContentEditorWidget>) {
  composition.setDashboardConfig({
    contentEditors: config.value.contentEditors.map(e => e.id === id ? { ...e, ...partial } : e)
  })
}
function removeEditor(id: string) {
  composition.setDashboardConfig({ contentEditors: config.value.contentEditors.filter(e => e.id !== id) })
}
function addField(editorId: string) {
  composition.setDashboardConfig({
    contentEditors: config.value.contentEditors.map(e => {
      if (e.id !== editorId) return e
      return { ...e, fields: [...e.fields, { id: crypto.randomUUID(), name: '', label: '', type: 'text' as const, required: false }] }
    })
  })
}
function updateField(editorId: string, fieldId: string, partial: Partial<ContentEditorField>) {
  composition.setDashboardConfig({
    contentEditors: config.value.contentEditors.map(e => {
      if (e.id !== editorId) return e
      return { ...e, fields: e.fields.map(f => f.id === fieldId ? { ...f, ...partial } : f) }
    })
  })
}
function removeField(editorId: string, fieldId: string) {
  composition.setDashboardConfig({
    contentEditors: config.value.contentEditors.map(e => {
      if (e.id !== editorId) return e
      return { ...e, fields: e.fields.filter(f => f.id !== fieldId) }
    })
  })
}

// --- Content Kit ---
function updateContentKitSection(id: string, partial: Partial<ContentKitSectionConfig>) {
  composition.setDashboardConfig({
    contentKit: {
      ...config.value.contentKit,
      sections: config.value.contentKit.sections.map(s => s.id === id ? { ...s, ...partial } : s)
    }
  })
}

const canContinue = computed(() => config.value.enabledWidgets.length > 0)

function handleContinue() {
  workflow.completeStep('dashboard')
  workflow.goToStep('finalize')
  router.push('/finalize')
}

const inputClass = 'w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors'
const smallInputClass = 'w-full px-2 py-1.5 rounded border text-xs focus:outline-none transition-colors'
const inputStyle = {
  backgroundColor: 'var(--theme-bg-secondary)',
  borderColor: 'var(--theme-border)',
  color: 'var(--theme-text-primary)',
  '--tw-ring-color': 'var(--theme-primary)'
}
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden" @click="activeEmojiPicker = null">

    <!-- Full-width workflow progress bar -->
    <div class="px-5 pt-5 pb-0 shrink-0">
      <WorkflowProgress />
    </div>

    <!-- Two-panel row -->
    <div class="flex flex-1 overflow-hidden">

    <!-- LEFT PANEL -->
    <div
      class="w-80 lg:w-96 shrink-0 flex flex-col border-r"
      :style="{ borderColor: 'var(--theme-border)' }"
    >
      <!-- Header -->
      <div class="p-5 border-b shrink-0" :style="{ borderColor: 'var(--theme-border)' }">
        <h1 class="text-lg font-bold" :style="{ color: 'var(--theme-text-primary)' }">Dashboard Builder</h1>
        <p class="text-xs mt-0.5" :style="{ color: 'var(--theme-text-secondary)' }">
          Configure the client dashboard at <span class="font-mono">dashboard.{{ domain }}.com</span>
        </p>
      </div>

      <!-- Tab Nav -->
      <nav class="p-3 border-b shrink-0 space-y-0.5" :style="{ borderColor: 'var(--theme-border)' }">
        <button
          @click="activeTab = 'widgets'"
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors"
          :style="activeTab === 'widgets'
            ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }
            : { color: 'var(--theme-text-secondary)' }"
        >
          <LayoutDashboard class="w-4 h-4 shrink-0" />
          Widgets
        </button>
        <button
          v-for="w in ALL_WIDGETS"
          :key="w.id"
          @click="activeTab = w.id"
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors"
          :style="activeTab === w.id
            ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }
            : { color: isEnabled(w.id) ? 'var(--theme-text-secondary)' : 'var(--theme-text-muted)' }"
        >
          <component
            :is="{ quickActions: Zap, analytics: BarChart3, tutorials: BookOpen, links: Link2, contentEditor: FileEdit }[w.id]"
            class="w-4 h-4 shrink-0"
          />
          {{ w.label }}
          <span
            v-if="!isEnabled(w.id)"
            class="ml-auto text-xs px-1.5 py-0.5 rounded"
            :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
          >Off</span>
        </button>

        <!-- Standard Pages separator -->
        <p class="text-[10px] font-semibold uppercase tracking-wider pt-3 pb-1 px-3" :style="{ color: 'var(--theme-text-muted)' }">Standard Pages</p>
        <button
          @click="activeTab = 'billing'"
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors"
          :style="activeTab === 'billing'
            ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }
            : { color: 'var(--theme-text-secondary)' }"
        >
          <CreditCard class="w-4 h-4 shrink-0" />
          Billing
        </button>
        <button
          @click="activeTab = 'contentKit'"
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors"
          :style="activeTab === 'contentKit'
            ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }
            : { color: 'var(--theme-text-secondary)' }"
        >
          <ClipboardList class="w-4 h-4 shrink-0" />
          Content Kit
        </button>
      </nav>

      <!-- Tab Content -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">

        <!-- WIDGETS TAB -->
        <template v-if="activeTab === 'widgets'">
          <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Toggle which sections appear on the client dashboard.</p>
          <div
            v-for="w in ALL_WIDGETS"
            :key="w.id"
            class="p-3 rounded-xl border flex items-start gap-3"
            :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
          >
            <component
              :is="{ quickActions: Zap, analytics: BarChart3, tutorials: BookOpen, links: Link2, contentEditor: FileEdit }[w.id]"
              class="w-4 h-4 mt-0.5 shrink-0"
              :style="{ color: isEnabled(w.id) ? 'var(--theme-primary)' : 'var(--theme-text-muted)' }"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium" :style="{ color: 'var(--theme-text-primary)' }">{{ w.label }}</p>
              <p class="text-xs mt-0.5" :style="{ color: 'var(--theme-text-muted)' }">{{ w.description }}</p>
            </div>
            <button
              @click="toggleWidget(w.id)"
              class="shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
              :style="isEnabled(w.id)
                ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }
                : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
            >{{ isEnabled(w.id) ? 'On' : 'Off' }}</button>
          </div>
        </template>

        <!-- QUICK ACTIONS TAB -->
        <template v-else-if="activeTab === 'quickActions'">
          <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Shortcut buttons shown at the top of the dashboard. Built-in actions are auto-seeded from your env config.</p>
          <div
            v-for="action in config.quickActions"
            :key="action.id"
            class="p-3 rounded-xl border space-y-2"
            :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
          >
            <div class="flex items-center gap-2">
              <Lock v-if="action.isBuiltIn" class="w-3.5 h-3.5 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
              <span v-if="action.isBuiltIn" class="text-xs px-1.5 py-0.5 rounded" :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }">Built-in</span>
              <button
                v-else
                @click="removeAction(action.id)"
                class="ml-auto p-1 rounded transition-colors hover:text-red-500"
                :style="{ color: 'var(--theme-text-muted)' }"
              ><Trash2 class="w-3.5 h-3.5" /></button>
            </div>
            <input
              :value="action.label"
              @input="updateAction(action.id, { label: ($event.target as HTMLInputElement).value })"
              placeholder="Label (e.g. View Live Site)"
              :class="inputClass"
              :style="inputStyle"
            />
            <input
              :value="action.url"
              @input="updateAction(action.id, { url: ($event.target as HTMLInputElement).value })"
              placeholder="URL"
              :class="inputClass"
              :style="inputStyle"
            />
          </div>
          <button
            @click="addAction"
            class="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed text-sm transition-colors"
            :style="{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }"
          ><Plus class="w-3.5 h-3.5" /> Add Action</button>
        </template>

        <!-- ANALYTICS TAB -->
        <template v-else-if="activeTab === 'analytics'">
          <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Configure site analytics and integration webhooks.</p>
          <div class="space-y-3">
            <!-- Simple Analytics (default) -->
            <div v-if="!config.useGoogleAnalytics">
              <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--theme-text-secondary)' }">Simple Analytics Site ID</label>
              <input
                :value="config.simpleAnalyticsId"
                @input="composition.setDashboardConfig({ simpleAnalyticsId: ($event.target as HTMLInputElement).value })"
                placeholder="yourdomain.com"
                :class="inputClass"
                :style="inputStyle"
              />
              <p class="text-xs mt-1" :style="{ color: 'var(--theme-text-muted)' }">Your domain as registered in Simple Analytics. Cookieless, privacy-first — no cookie banner needed.</p>
            </div>

            <!-- GA4 (override) -->
            <div v-else>
              <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--theme-text-secondary)' }">GA4 Measurement ID</label>
              <input
                :value="config.analyticsId"
                @input="composition.setDashboardConfig({ analyticsId: ($event.target as HTMLInputElement).value })"
                placeholder="G-XXXXXXXXXX"
                :class="inputClass"
                :style="inputStyle"
              />
              <p class="text-xs mt-1" :style="{ color: 'var(--theme-text-muted)' }">Found in Google Analytics → Admin → Data Streams.</p>
            </div>

            <!-- Use Google Analytics override toggle -->
            <div class="flex items-center justify-between rounded-lg p-3 border" :style="{ borderColor: config.useGoogleAnalytics ? 'var(--theme-warning)' : 'var(--theme-border)', backgroundColor: config.useGoogleAnalytics ? 'var(--theme-warning-light)' : 'var(--theme-bg-secondary)' }">
              <div>
                <p class="text-xs font-semibold" :style="{ color: 'var(--theme-text-primary)' }">Use Google Analytics instead</p>
                <p class="text-xs mt-0.5" :style="{ color: 'var(--theme-text-muted)' }">Override with GA4 if the client specifically requests it. Requires a cookie consent banner.</p>
              </div>
              <button
                @click="composition.setDashboardConfig({ useGoogleAnalytics: !config.useGoogleAnalytics })"
                class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ml-3"
                :style="{ backgroundColor: config.useGoogleAnalytics ? 'var(--theme-warning)' : 'var(--theme-bg-tertiary)' }"
              >
                <span
                  class="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow-sm"
                  :class="config.useGoogleAnalytics ? 'translate-x-4.5' : 'translate-x-0.5'"
                />
              </button>
            </div>
            <!-- Page filtering (SA only) -->
            <div v-if="!config.useGoogleAnalytics" class="pt-1 border-t space-y-3" :style="{ borderColor: 'var(--theme-border)' }">
              <div>
                <p class="text-xs font-semibold mb-1" :style="{ color: 'var(--theme-text-secondary)' }">Page filtering</p>
                <p class="text-xs mb-2" :style="{ color: 'var(--theme-text-muted)' }">These routes are your dashboard pages — they'll be hidden from the public traffic view by default, since they only appear when you log in.</p>
              </div>

              <div>
                <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--theme-text-secondary)' }">Goal page</label>
                <input
                  :value="config.analyticsConversionPage"
                  @input="composition.setDashboardConfig({ analyticsConversionPage: ($event.target as HTMLInputElement).value })"
                  placeholder="/contact"
                  :class="inputClass"
                  :style="inputStyle"
                />
                <p class="text-xs mt-1" :style="{ color: 'var(--theme-text-muted)' }">The page you most want visitors to reach (e.g. /contact, /donate, /apply).</p>
              </div>

              <div>
                <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--theme-text-secondary)' }">Internal routes</label>
                <div class="flex flex-wrap gap-1.5 mb-2">
                  <span
                    v-for="route in config.analyticsInternalRoutes"
                    :key="route"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    :style="{ backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-secondary)', border: '1px solid var(--theme-border)' }"
                  >
                    {{ route }}
                    <button @click="removeInternalRoute(route)" class="ml-0.5 hover:text-red-500 transition-colors">&times;</button>
                  </span>
                  <span v-if="config.analyticsInternalRoutes.length === 0" class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">No routes added.</span>
                </div>
                <div class="flex gap-2">
                  <input
                    v-model="newRouteInput"
                    @keydown.enter.prevent="addInternalRoute"
                    placeholder="/route-path"
                    :class="inputClass"
                    :style="inputStyle"
                    class="flex-1"
                  />
                  <button
                    @click="addInternalRoute"
                    class="px-3 py-1.5 rounded-lg text-xs font-medium shrink-0"
                    :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
                  >Add</button>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--theme-text-secondary)' }">Contact Form Webhook URL</label>
              <input
                :value="config.contactWebhookUrl"
                @input="composition.setDashboardConfig({ contactWebhookUrl: ($event.target as HTMLInputElement).value })"
                placeholder="https://your-dashboard.com/.netlify/functions/receive-support-request"
                :class="inputClass"
                :style="inputStyle"
              />
              <p class="text-xs mt-1" :style="{ color: 'var(--theme-text-muted)' }">Client contact form submissions POST here with category, subject, description, name, and email.</p>
            </div>

            <!-- Auth0 separator -->
            <div class="pt-1 border-t" :style="{ borderColor: 'var(--theme-border)' }">
              <p class="text-xs font-semibold mb-3 flex items-center gap-1.5" :style="{ color: 'var(--theme-text-secondary)' }">
                <Lock class="w-3.5 h-3.5" /> Auth0 Login
              </p>
              <p class="text-xs mb-3" :style="{ color: 'var(--theme-text-muted)' }">Every client dashboard requires Auth0 login. Configure the Auth0 Application for this dashboard deployment.</p>
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--theme-text-secondary)' }">Auth0 Domain</label>
                  <input
                    :value="config.auth0Domain"
                    @input="composition.setDashboardConfig({ auth0Domain: ($event.target as HTMLInputElement).value })"
                    placeholder="your-tenant.us.auth0.com"
                    :class="inputClass"
                    :style="inputStyle"
                  />
                  <p class="text-xs mt-1" :style="{ color: 'var(--theme-text-muted)' }">Found in Auth0 → Applications → Settings.</p>
                </div>
                <div>
                  <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--theme-text-secondary)' }">Auth0 Client ID</label>
                  <input
                    :value="config.auth0ClientId"
                    @input="composition.setDashboardConfig({ auth0ClientId: ($event.target as HTMLInputElement).value })"
                    placeholder="abc123XYZ..."
                    :class="inputClass"
                    :style="inputStyle"
                  />
                  <p class="text-xs mt-1" :style="{ color: 'var(--theme-text-muted)' }">The Client ID for this dashboard's Auth0 Application (not the website's).</p>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- TUTORIAL VIDEOS TAB -->
        <template v-else-if="activeTab === 'tutorials'">
          <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Add tutorial videos. Supports YouTube and Mux.</p>
          <div
            v-for="video in config.tutorialVideos"
            :key="video.id"
            class="p-3 rounded-xl border space-y-2 overflow-hidden"
            :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
          >
            <div class="flex items-center justify-between">
              <!-- Source selector -->
              <select
                :value="video.source ?? 'youtube'"
                @change="updateVideo(video.id, { source: ($event.target as HTMLSelectElement).value as TutorialVideo['source'] })"
                class="text-xs px-2 py-1 rounded-md border focus:outline-none"
                :style="{ backgroundColor: 'var(--theme-bg-tertiary)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }"
              >
                <option value="youtube">YouTube</option>
                <option value="mux">Mux</option>
              </select>
              <button @click="removeVideo(video.id)" class="p-1 rounded transition-colors hover:text-red-500" :style="{ color: 'var(--theme-text-muted)' }">
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
            <input :value="video.title" @input="updateVideo(video.id, { title: ($event.target as HTMLInputElement).value })" placeholder="Title" :class="inputClass" :style="inputStyle" />
            <!-- URL or Mux Playback ID -->
            <input
              v-if="(video.source ?? 'youtube') !== 'mux'"
              :value="video.url"
              @input="updateVideo(video.id, { url: ($event.target as HTMLInputElement).value })"
              placeholder="YouTube URL"
              :class="inputClass"
              :style="inputStyle"
            />
            <input
              v-else
              :value="video.muxPlaybackId"
              @input="updateVideo(video.id, { muxPlaybackId: ($event.target as HTMLInputElement).value })"
              placeholder="Mux Playback ID (e.g. abc123xyz)"
              :class="inputClass"
              :style="inputStyle"
            />
            <input :value="video.category" @input="updateVideo(video.id, { category: ($event.target as HTMLInputElement).value })" placeholder="Category (e.g. CMS, SEO)" :class="inputClass" :style="inputStyle" />
            <textarea :value="video.description" @input="updateVideo(video.id, { description: ($event.target as HTMLTextAreaElement).value })" placeholder="Description (optional)" rows="2" :class="inputClass" :style="inputStyle" />
          </div>
          <div v-if="config.tutorialVideos.length === 0" class="text-xs text-center py-4" :style="{ color: 'var(--theme-text-muted)' }">No videos yet. Add your first tutorial below.</div>
          <button @click="addVideo" class="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed text-sm transition-colors" :style="{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }">
            <Plus class="w-3.5 h-3.5" /> Add Video
          </button>
        </template>

        <!-- HELPFUL LINKS TAB -->
        <template v-else-if="activeTab === 'links'">
          <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Curated resource cards shown on the dashboard.</p>
          <div
            v-for="link in config.helpfulLinks"
            :key="link.id"
            class="p-3 rounded-xl border space-y-2 overflow-hidden"
            :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
          >
            <div class="flex justify-end">
              <button @click="removeLink(link.id)" class="p-1 rounded transition-colors hover:text-red-500" :style="{ color: 'var(--theme-text-muted)' }"><Trash2 class="w-3.5 h-3.5" /></button>
            </div>
            <!-- Emoji picker + title -->
            <div class="flex gap-2 items-start">
              <div class="relative shrink-0" @click.stop>
                <button
                  @click="activeEmojiPicker = activeEmojiPicker === link.id ? null : link.id"
                  class="w-10 h-10 rounded-lg border flex items-center justify-center text-xl leading-none transition-colors"
                  :style="{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: activeEmojiPicker === link.id ? 'var(--theme-primary)' : 'var(--theme-border)' }"
                >{{ link.emoji || '🔗' }}</button>
                <!-- Emoji grid panel -->
                <div
                  v-if="activeEmojiPicker === link.id"
                  class="absolute top-full left-0 mt-1 z-50 rounded-xl border shadow-xl p-2 grid grid-cols-6 gap-0.5 w-52"
                  :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
                >
                  <button
                    v-for="emoji in COMMON_EMOJIS"
                    :key="emoji"
                    @click="selectEmoji(link.id, emoji)"
                    class="w-7 h-7 flex items-center justify-center rounded text-base transition-colors"
                    :style="{ backgroundColor: 'transparent' }"
                  >{{ emoji }}</button>
                </div>
              </div>
              <input :value="link.title" @input="updateLink(link.id, { title: ($event.target as HTMLInputElement).value })" placeholder="Title" :class="inputClass" :style="inputStyle" />
            </div>
            <input :value="link.url" @input="updateLink(link.id, { url: ($event.target as HTMLInputElement).value })" placeholder="URL" :class="inputClass" :style="inputStyle" />
            <input :value="link.description" @input="updateLink(link.id, { description: ($event.target as HTMLInputElement).value })" placeholder="Description" :class="inputClass" :style="inputStyle" />
          </div>
          <div v-if="linksWereSeeded" class="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs" :style="{ backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-muted)' }">
            <span>Links auto-populated from your project config. Edit or remove as needed.</span>
            <button @click="linksWereSeeded = false" class="shrink-0 font-medium hover:underline" :style="{ color: 'var(--theme-primary)' }">Dismiss</button>
          </div>
          <div v-if="config.helpfulLinks.length === 0" class="text-xs text-center py-4" :style="{ color: 'var(--theme-text-muted)' }">No links yet. Add your first resource below.</div>
          <button @click="addLink" class="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed text-sm transition-colors" :style="{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }">
            <Plus class="w-3.5 h-3.5" /> Add Link
          </button>
        </template>

        <!-- CONTENT EDITORS TAB -->
        <template v-else-if="activeTab === 'contentEditor'">
          <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Define simple forms that let clients update Sanity content and trigger a site rebuild.</p>
          <p v-if="schemas.length === 0" class="text-xs px-3 py-2 rounded-lg" :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }">
            Tip: Complete the CMS step first to enable schema dropdowns here.
          </p>
          <div
            v-for="editor in config.contentEditors"
            :key="editor.id"
            class="p-3 rounded-xl border space-y-2 overflow-hidden"
            :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
          >
            <div class="flex justify-between items-center">
              <span class="text-xs font-semibold truncate mr-2" :style="{ color: 'var(--theme-text-primary)' }">{{ editor.label || 'Untitled Widget' }}</span>
              <button @click="removeEditor(editor.id)" class="p-1 rounded transition-colors hover:text-red-500 shrink-0" :style="{ color: 'var(--theme-text-muted)' }"><Trash2 class="w-3.5 h-3.5" /></button>
            </div>
            <input :value="editor.label" @input="updateEditor(editor.id, { label: ($event.target as HTMLInputElement).value })" placeholder="Widget label (e.g. Board Members)" :class="inputClass" :style="inputStyle" />

            <!-- Document type: select from schemas if available, else text input -->
            <div>
              <label class="block text-xs mb-1" :style="{ color: 'var(--theme-text-muted)' }">Sanity document type</label>
              <select
                v-if="schemas.length > 0"
                :value="editor.documentType"
                @change="updateEditor(editor.id, { documentType: ($event.target as HTMLSelectElement).value, fields: [] })"
                :class="inputClass"
                :style="inputStyle"
              >
                <option value="">Select document type...</option>
                <option v-for="s in schemas" :key="s.documentType" :value="s.documentType">
                  {{ s.title }} ({{ s.documentType }})
                </option>
              </select>
              <input
                v-else
                :value="editor.documentType"
                @input="updateEditor(editor.id, { documentType: ($event.target as HTMLInputElement).value })"
                placeholder="e.g. boardMember"
                :class="inputClass"
                :style="inputStyle"
              />
            </div>

            <textarea :value="editor.description" @input="updateEditor(editor.id, { description: ($event.target as HTMLTextAreaElement).value })" placeholder="Description shown to client" rows="2" :class="inputClass" :style="inputStyle" />

            <!-- Fields -->
            <div class="space-y-2">
              <p class="text-xs font-medium" :style="{ color: 'var(--theme-text-secondary)' }">Fields</p>
              <div
                v-for="field in editor.fields"
                :key="field.id"
                class="p-2 rounded-lg border overflow-hidden"
                :style="{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-secondary)' }"
              >
                <!-- Label input -->
                <input
                  :value="field.label"
                  @input="updateField(editor.id, field.id, { label: ($event.target as HTMLInputElement).value })"
                  placeholder="Display label"
                  :class="smallInputClass"
                  :style="inputStyle"
                />
                <!-- Field name: select from schema fields if available, else text input -->
                <div class="mt-1.5">
                  <select
                    v-if="editor.documentType && getSchemaFields(editor.documentType).length > 0"
                    :value="field.name"
                    @change="updateField(editor.id, field.id, { name: ($event.target as HTMLSelectElement).value })"
                    :class="smallInputClass + ' font-mono mt-0'"
                    :style="inputStyle"
                  >
                    <option value="">Select field...</option>
                    <option v-for="f in getSchemaFields(editor.documentType)" :key="f.name" :value="f.name">
                      {{ f.name }} ({{ f.type }})
                    </option>
                  </select>
                  <input
                    v-else
                    :value="field.name"
                    @input="updateField(editor.id, field.id, { name: ($event.target as HTMLInputElement).value })"
                    placeholder="Sanity field name"
                    :class="smallInputClass + ' font-mono mt-1.5'"
                    :style="inputStyle"
                  />
                </div>
                <!-- Type + required + delete -->
                <div class="flex items-center gap-2 mt-1.5">
                  <select
                    :value="field.type"
                    @change="updateField(editor.id, field.id, { type: ($event.target as HTMLSelectElement).value as ContentEditorField['type'] })"
                    class="flex-1 min-w-0 px-2 py-1.5 rounded border text-xs focus:outline-none"
                    :style="inputStyle"
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Rich Text</option>
                    <option value="image">Image</option>
                    <option value="file">File</option>
                  </select>
                  <label class="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap shrink-0" :style="{ color: 'var(--theme-text-secondary)' }">
                    <input type="checkbox" :checked="field.required" @change="updateField(editor.id, field.id, { required: ($event.target as HTMLInputElement).checked })" class="rounded" />
                    Req
                  </label>
                  <button @click="removeField(editor.id, field.id)" class="p-1 rounded hover:text-red-500 shrink-0" :style="{ color: 'var(--theme-text-muted)' }"><Trash2 class="w-3 h-3" /></button>
                </div>
              </div>
              <button @click="addField(editor.id)" class="w-full flex items-center justify-center gap-1 py-1.5 rounded border border-dashed text-xs transition-colors" :style="{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }">
                <Plus class="w-3 h-3" /> Add Field
              </button>
            </div>
          </div>
          <div v-if="config.contentEditors.length === 0" class="text-xs text-center py-4" :style="{ color: 'var(--theme-text-muted)' }">No content editors yet. Add one below.</div>
          <button @click="addEditor" class="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed text-sm transition-colors" :style="{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }">
            <Plus class="w-3.5 h-3.5" /> Add Content Editor
          </button>
        </template>

        <!-- BILLING TAB -->
        <template v-else-if="activeTab === 'billing'">
          <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Configure the billing page that connects to Stripe Customer Portal. This page is always present on the client dashboard.</p>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--theme-text-secondary)' }">Stripe Customer ID</label>
              <input
                :value="config.billing.stripeCustomerId"
                @input="composition.setDashboardConfig({ billing: { ...config.billing, stripeCustomerId: ($event.target as HTMLInputElement).value } })"
                placeholder="cus_xxxxxxxxxxxxxxxxxx"
                :class="inputClass"
                :style="inputStyle"
              />
              <p class="text-xs mt-1" :style="{ color: 'var(--theme-text-muted)' }">From Stripe Dashboard or the client record in your admin tool. Required for the billing page to function.</p>
            </div>

            <div class="pt-1 border-t" :style="{ borderColor: 'var(--theme-border)' }">
              <div class="flex items-center justify-between py-2">
                <div>
                  <p class="text-sm font-medium" :style="{ color: 'var(--theme-text-primary)' }">Show Pending Charges</p>
                  <p class="text-xs mt-0.5" :style="{ color: 'var(--theme-text-muted)' }">Display open invoices and ad-hoc charges (day rate work, etc.) on the billing page.</p>
                </div>
                <button
                  @click="composition.setDashboardConfig({ billing: { ...config.billing, showPendingCharges: !config.billing.showPendingCharges } })"
                  class="shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                  :style="config.billing.showPendingCharges
                    ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }
                    : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
                >{{ config.billing.showPendingCharges ? 'On' : 'Off' }}</button>
              </div>
            </div>

            <div class="pt-1 border-t" :style="{ borderColor: 'var(--theme-border)' }">
              <div class="flex items-center justify-between py-2">
                <div>
                  <p class="text-sm font-medium" :style="{ color: 'var(--theme-text-primary)' }">Show Offline Invoices</p>
                  <p class="text-xs mt-0.5" :style="{ color: 'var(--theme-text-muted)' }">Include offline payment invoices (Zelle/Check) alongside Stripe invoices.</p>
                </div>
                <button
                  @click="composition.setDashboardConfig({ billing: { ...config.billing, showOfflineInvoices: !config.billing.showOfflineInvoices } })"
                  class="shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                  :style="config.billing.showOfflineInvoices
                    ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }
                    : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
                >{{ config.billing.showOfflineInvoices ? 'On' : 'Off' }}</button>
              </div>
            </div>
          </div>
        </template>

        <!-- CONTENT KIT TAB -->
        <template v-else-if="activeTab === 'contentKit'">
          <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Configure the Content Kit form that clients fill out to provide their business info, story, and assets for the build.</p>

          <!-- Master toggle -->
          <div
            class="p-3 rounded-xl border flex items-center justify-between"
            :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
          >
            <div>
              <p class="text-sm font-medium" :style="{ color: 'var(--theme-text-primary)' }">Enable Content Kit</p>
              <p class="text-xs mt-0.5" :style="{ color: 'var(--theme-text-muted)' }">Show the Content Kit page in the client dashboard sidebar.</p>
            </div>
            <button
              @click="composition.setDashboardConfig({ contentKit: { ...config.contentKit, enabled: !config.contentKit.enabled } })"
              class="shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
              :style="config.contentKit.enabled
                ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }
                : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
            >{{ config.contentKit.enabled ? 'On' : 'Off' }}</button>
          </div>

          <template v-if="config.contentKit.enabled">
            <!-- Welcome message -->
            <div>
              <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--theme-text-secondary)' }">Welcome Message</label>
              <textarea
                :value="config.contentKit.welcomeMessage"
                @input="composition.setDashboardConfig({ contentKit: { ...config.contentKit, welcomeMessage: ($event.target as HTMLTextAreaElement).value } })"
                placeholder="Help us build the perfect website for you! Fill out each section below with as much detail as you can."
                rows="3"
                :class="inputClass"
                :style="inputStyle"
              />
              <p class="text-xs mt-1" :style="{ color: 'var(--theme-text-muted)' }">Shown at the top of the Content Kit form. Leave blank for default.</p>
            </div>

            <!-- Max personality picks -->
            <div>
              <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--theme-text-secondary)' }">Max Brand Personality Picks</label>
              <select
                :value="config.contentKit.maxPersonalityPicks"
                @change="composition.setDashboardConfig({ contentKit: { ...config.contentKit, maxPersonalityPicks: Number(($event.target as HTMLSelectElement).value) } })"
                :class="inputClass"
                :style="inputStyle"
              >
                <option :value="2">2</option>
                <option :value="3">3</option>
                <option :value="4">4</option>
                <option :value="5">5</option>
              </select>
              <p class="text-xs mt-1" :style="{ color: 'var(--theme-text-muted)' }">How many brand personality traits the client can select in the Brand & Style section.</p>
            </div>

            <!-- Personality preview chips -->
            <div>
              <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Personality Options Preview</label>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="p in BRAND_PERSONALITY_OPTIONS"
                  :key="p"
                  class="px-2.5 py-1 rounded-full text-xs font-medium"
                  :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-secondary)' }"
                >{{ p }}</span>
              </div>
              <p class="text-xs mt-1.5" :style="{ color: 'var(--theme-text-muted)' }">All 12 options are shown to the client as toggleable chips.</p>
            </div>

            <!-- Email notification toggle -->
            <div
              class="p-3 rounded-xl border flex items-center justify-between"
              :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
            >
              <div>
                <p class="text-sm font-medium" :style="{ color: 'var(--theme-text-primary)' }">Completion Email</p>
                <p class="text-xs mt-0.5" :style="{ color: 'var(--theme-text-muted)' }">Notify admin when the client completes all required sections.</p>
              </div>
              <button
                @click="composition.setDashboardConfig({ contentKit: { ...config.contentKit, completionEmailNotify: !config.contentKit.completionEmailNotify } })"
                class="shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                :style="config.contentKit.completionEmailNotify
                  ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }
                  : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
              >{{ config.contentKit.completionEmailNotify ? 'On' : 'Off' }}</button>
            </div>

            <!-- Sections list -->
            <div class="pt-1 border-t" :style="{ borderColor: 'var(--theme-border)' }">
              <p class="text-xs font-semibold mb-3" :style="{ color: 'var(--theme-text-secondary)' }">Sections</p>
              <p class="text-xs mb-3" :style="{ color: 'var(--theme-text-muted)' }">Toggle sections on/off and mark which are required for completion.</p>
              <div class="space-y-2">
                <div
                  v-for="section in config.contentKit.sections"
                  :key="section.id"
                  class="p-3 rounded-xl border flex items-start gap-3"
                  :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
                >
                  <GripVertical class="w-3.5 h-3.5 mt-0.5 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="text-sm font-medium" :style="{ color: section.enabled ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)' }">{{ section.label }}</p>
                      <span
                        v-if="section.required && section.enabled"
                        class="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
                      >Required</span>
                    </div>
                    <p class="text-xs mt-0.5" :style="{ color: 'var(--theme-text-muted)' }">{{ section.description }}</p>
                    <!-- Required toggle (only when enabled) -->
                    <label
                      v-if="section.enabled"
                      class="flex items-center gap-1.5 mt-2 text-xs cursor-pointer"
                      :style="{ color: 'var(--theme-text-secondary)' }"
                    >
                      <input
                        type="checkbox"
                        :checked="section.required"
                        @change="updateContentKitSection(section.id, { required: ($event.target as HTMLInputElement).checked })"
                        class="rounded"
                      />
                      Required for completion
                    </label>
                  </div>
                  <button
                    @click="updateContentKitSection(section.id, { enabled: !section.enabled })"
                    class="shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                    :style="section.enabled
                      ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }
                      : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
                  >{{ section.enabled ? 'On' : 'Off' }}</button>
                </div>
              </div>
            </div>
          </template>
        </template>

        <!-- Continue -->
        <div class="pt-2 flex justify-end">
          <button
            :disabled="!canContinue"
            @click="handleContinue"
            class="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
          >
            Continue to Finalize
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- RIGHT PANEL: iframe preview -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Toolbar -->
      <div
        class="flex items-center gap-2 px-4 py-2.5 border-b shrink-0"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <div class="flex gap-1 rounded-lg p-1" :style="{ backgroundColor: 'var(--theme-bg-secondary)' }">
          <button
            @click="deviceWidth = 'desktop'"
            class="p-1.5 rounded-md transition-colors"
            :style="deviceWidth === 'desktop' ? { backgroundColor: 'var(--theme-bg-card)', color: 'var(--theme-primary)' } : { color: 'var(--theme-text-muted)' }"
          ><Monitor class="w-4 h-4" /></button>
          <button
            @click="deviceWidth = 'tablet'"
            class="p-1.5 rounded-md transition-colors"
            :style="deviceWidth === 'tablet' ? { backgroundColor: 'var(--theme-bg-card)', color: 'var(--theme-primary)' } : { color: 'var(--theme-text-muted)' }"
          ><Tablet class="w-4 h-4" /></button>
          <button
            @click="deviceWidth = 'mobile'"
            class="p-1.5 rounded-md transition-colors"
            :style="deviceWidth === 'mobile' ? { backgroundColor: 'var(--theme-bg-card)', color: 'var(--theme-primary)' } : { color: 'var(--theme-text-muted)' }"
          ><Smartphone class="w-4 h-4" /></button>
        </div>
        <span class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">{{ widthMap[deviceWidth] }}</span>
        <a
          :href="iframeSrc"
          target="_blank"
          class="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
          :style="{ backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-secondary)' }"
        >
          <ExternalLink class="w-3.5 h-3.5" />
          Open Preview
        </a>
      </div>

      <!-- iframe area -->
      <div
        class="flex-1 overflow-auto flex justify-center p-4"
        :style="{ backgroundColor: 'var(--theme-bg-secondary)' }"
      >
        <div
          class="rounded-xl overflow-hidden shadow-xl h-full transition-all duration-300"
          :style="{ width: widthMap[deviceWidth] }"
        >
          <iframe
            ref="iframeRef"
            :src="iframeSrc"
            class="w-full h-full border-0 bg-white"
          />
        </div>
      </div>
    </div>

    </div><!-- end two-panel row -->
  </div>
</template>
