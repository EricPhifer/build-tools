<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  LayoutDashboard, BarChart3, BookOpen, Link2, FileEdit, Zap,
  ExternalLink, MessageSquare, Send, CheckCircle2, LogIn,
  Menu, X, ChevronLeft, ChevronRight,
  UserCircle, LogOut, Sun, Moon, CreditCard, ClipboardList,
  Upload, ChevronDown
} from 'lucide-vue-next'
import type { DashboardConfig, TutorialVideo } from '../types/dashboard'
import { BRAND_PERSONALITY_OPTIONS } from '../types/dashboard'

const route        = useRoute()
const clientName   = computed(() => (route.query.clientName as string) || 'Client Dashboard')
const primaryColor = computed(() => (route.query.primaryColor as string) || '#6366f1')
const logoUrl      = computed(() => (route.query.logoUrl as string) || '')

const config      = ref<DashboardConfig | null>(null)
const activePage  = ref('overview')
const collapsed   = ref(false)   // desktop sidebar collapsed
const mobileOpen  = ref(false)   // mobile sidebar overlay open
const darkMode    = ref(false)   // dark mode toggle (preview only)

// ─── Contact form state ───────────────────────────────────────────────────────
const contactCategory    = ref('bug')
const contactSubject     = ref('')
const contactDescription = ref('')
const contactName        = ref('')
const contactEmail       = ref('')
const contactSubmitting  = ref(false)
const contactSubmitted   = ref(false)

const CONTACT_CATEGORIES = [
  { value: 'bug',      label: '🐛 Bug Report' },
  { value: 'addition', label: '+ Site Addition' },
  { value: 'service',  label: '🔧 Service Request' },
  { value: 'content',  label: '✏️ Content Change' },
  { value: 'general',  label: '❓ General Question' },
]

async function submitContact() {
  if (!contactSubject.value.trim() || !contactDescription.value.trim()) return
  contactSubmitting.value = true
  const payload = {
    category:     contactCategory.value,
    subject:      contactSubject.value,
    description:  contactDescription.value,
    name:         contactName.value,
    email:        contactEmail.value,
    clientName:   clientName.value,
    submittedAt:  new Date().toISOString()
  }
  if (config.value?.contactWebhookUrl) {
    try {
      await fetch(config.value.contactWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch { /* ignore network errors */ }
  }
  contactSubmitting.value  = false
  contactSubmitted.value   = true
  contactSubject.value     = ''
  contactDescription.value = ''
  setTimeout(() => { contactSubmitted.value = false }, 6000)
}

// ─── Video helpers ────────────────────────────────────────────────────────────
function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] ?? null : null
}
function getVideoThumbnail(video: TutorialVideo): string | null {
  if (video.source === 'mux' && video.muxPlaybackId)
    return `https://image.mux.com/${video.muxPlaybackId}/thumbnail.jpg?width=640&fit_mode=pad`
  const id = getYouTubeId(video.url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}
function getVideoUrl(video: TutorialVideo): string {
  if (video.source === 'mux' && video.muxPlaybackId)
    return `https://player.mux.com/${video.muxPlaybackId}`
  return video.url
}
function hasVideoContent(video: TutorialVideo): boolean {
  return video.source === 'mux' ? !!video.muxPlaybackId : !!video.url
}

const videosByCategory = computed(() => {
  if (!config.value) return {} as Record<string, TutorialVideo[]>
  const map: Record<string, TutorialVideo[]> = {}
  for (const video of config.value.tutorialVideos) {
    const cat = video.category || 'General'
    if (!map[cat]) map[cat] = []
    map[cat].push(video)
  }
  return map
})

// ─── Nav items ────────────────────────────────────────────────────────────────
interface NavItem { id: string; label: string; icon: unknown }

const navItems = computed((): NavItem[] => {
  const items: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard }
  ]
  if (config.value?.enabledWidgets.includes('analytics'))
    items.push({ id: 'analytics', label: 'Analytics', icon: BarChart3 })
  if (config.value?.enabledWidgets.includes('contentEditor') && config.value.contentEditors.some(e => e.label))
    items.push({ id: 'content', label: 'Content', icon: FileEdit })
  const hasResources =
    (config.value?.enabledWidgets.includes('tutorials') && config.value.tutorialVideos.some(v => v.title && hasVideoContent(v))) ||
    (config.value?.enabledWidgets.includes('links') && config.value.links.some(l => l.title && l.url))
  if (hasResources)
    items.push({ id: 'resources', label: 'Resources', icon: BookOpen })
  items.push({ id: 'billing', label: 'Billing', icon: CreditCard })
  if (config.value?.contentKit?.enabled)
    items.push({ id: 'contentKit', label: 'Content Kit', icon: ClipboardList })
  items.push({ id: 'contact', label: 'Contact & Support', icon: MessageSquare })
  return items
})

const currentPageLabel = computed(() => {
  if (activePage.value === 'login') return 'Login Page Preview'
  return navItems.value.find(n => n.id === activePage.value)?.label ?? 'Overview'
})

// ─── Overview helpers ─────────────────────────────────────────────────────────
const quickActions = computed(() =>
  config.value?.enabledWidgets.includes('links')
    ? config.value.links.filter(l => !l.description && l.title && l.url)
    : []
)

const summaryCards = computed(() => {
  if (!config.value) return []
  const cards: { id: string; title: string; sub: string; icon: unknown }[] = []
  if (config.value.enabledWidgets.includes('analytics'))
    cards.push({ id: 'analytics', title: 'Analytics', icon: BarChart3,
      sub: config.value.analyticsId ? 'GA4 Connected' : 'Traffic overview' })
  if (config.value.enabledWidgets.includes('contentEditor') && config.value.contentEditors.some(e => e.label)) {
    const n = config.value.contentEditors.filter(e => e.label).length
    cards.push({ id: 'content', title: 'Content', icon: FileEdit,
      sub: `${n} editor${n === 1 ? '' : 's'} available` })
  }
  const videoCount = config.value.tutorialVideos.filter(v => v.title && hasVideoContent(v)).length
  const linkCount  = config.value.links.filter(l => !!l.description && l.title && l.url).length
  if ((config.value.enabledWidgets.includes('tutorials') && videoCount > 0) ||
      (config.value.enabledWidgets.includes('links') && linkCount > 0)) {
    const parts = []
    if (videoCount > 0) parts.push(`${videoCount} video${videoCount === 1 ? '' : 's'}`)
    if (linkCount > 0)  parts.push(`${linkCount} link${linkCount === 1 ? '' : 's'}`)
    cards.push({ id: 'resources', title: 'Resources', icon: BookOpen, sub: parts.join(' · ') })
  }
  cards.push({ id: 'billing', title: 'Billing', icon: CreditCard,
    sub: 'Manage subscription & payments' })
  if (config.value?.contentKit?.enabled) {
    const enabledSections = config.value.contentKit.sections.filter(s => s.enabled).length
    cards.push({ id: 'contentKit', title: 'Content Kit', icon: ClipboardList,
      sub: `${enabledSections} section${enabledSections === 1 ? '' : 's'} to complete` })
  }
  cards.push({ id: 'contact', title: 'Contact & Support', icon: MessageSquare,
    sub: 'Get help from your developer' })
  return cards
})

const today = computed(() =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
)

// ─── Mount ────────────────────────────────────────────────────────────────────
onMounted(() => {
  try {
    const raw = localStorage.getItem('build-tools-site-builder')
    if (raw) config.value = JSON.parse(raw).dashboardConfig ?? null
  } catch { /* ignore */ }
})
</script>

<template>
  <div class="flex h-screen overflow-hidden font-sans transition-colors duration-200" :class="darkMode ? 'bg-gray-950' : 'bg-gray-50'">

    <!-- ─── MOBILE BACKDROP ───────────────────────────────────────────────────── -->
    <div
      v-if="mobileOpen"
      @click="mobileOpen = false"
      class="fixed inset-0 bg-black/50 z-30 sm:hidden"
    />

    <!-- ─── SIDEBAR ──────────────────────────────────────────────────────────── -->
    <aside
      class="fixed sm:relative inset-y-0 left-0 z-40 bg-gray-900 flex flex-col shrink-0 transition-all duration-200"
      :style="{ width: collapsed ? '56px' : '208px' }"
      :class="mobileOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'"
    >
      <!-- Brand header -->
      <div
        class="border-b border-white/10 flex items-center gap-3 shrink-0 overflow-hidden transition-all duration-200"
        :class="collapsed ? 'px-2 py-4 justify-center' : 'px-4 py-4'"
      >
        <!-- Logo image when available -->
        <img
          v-if="logoUrl"
          :src="logoUrl"
          :alt="clientName"
          class="object-contain shrink-0 transition-all duration-200"
          :style="{ height: '32px', maxWidth: collapsed ? '32px' : '120px' }"
        />
        <!-- Fallback: initial avatar -->
        <div
          v-else
          class="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
          :style="{ backgroundColor: primaryColor }"
        >{{ clientName.charAt(0) }}</div>
        <!-- Client name (hidden when collapsed) -->
        <div v-if="!collapsed" class="min-w-0">
          <p class="text-white font-semibold text-sm truncate">{{ clientName }}</p>
          <p class="text-gray-500 text-xs">Dashboard</p>
        </div>
      </div>

      <!-- Nav items -->
      <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="activePage = item.id; mobileOpen = false"
          class="w-full flex items-center rounded-lg text-sm font-medium text-left transition-colors"
          :class="[
            collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
            activePage !== item.id ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-white'
          ]"
          :style="activePage === item.id ? { backgroundColor: primaryColor } : {}"
          :title="collapsed ? item.label : undefined"
        >
          <component :is="item.icon" class="w-4 h-4 shrink-0" />
          <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
        </button>
      </nav>

      <!-- Sidebar footer: user / dark mode / login preview / collapse -->
      <div class="border-t border-white/10 shrink-0">

        <!-- User info row -->
        <div class="px-3 py-3 flex items-center" :class="collapsed ? 'justify-center' : 'gap-3'">
          <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <UserCircle class="w-5 h-5 text-gray-400" />
          </div>
          <div v-if="!collapsed" class="flex-1 min-w-0">
            <p class="text-white text-xs font-medium truncate">Demo User</p>
            <p class="text-gray-500 text-xs truncate">{{ clientName }}</p>
          </div>
          <!-- Login page preview icon (replaces logout in user row) -->
          <button
            v-if="!collapsed"
            @click="activePage = 'login'; mobileOpen = false"
            class="text-gray-500 hover:text-white transition-colors shrink-0"
            title="Login Page Preview"
          >
            <LogIn class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Dark mode toggle -->
        <button
          @click="darkMode = !darkMode"
          class="w-full flex items-center text-gray-500 hover:text-white hover:bg-white/5 transition-colors text-xs"
          :class="collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'"
          :title="collapsed ? (darkMode ? 'Light mode' : 'Dark mode') : undefined"
        >
          <Sun v-if="darkMode" class="w-4 h-4 shrink-0" />
          <Moon v-else class="w-4 h-4 shrink-0" />
          <span v-if="!collapsed">{{ darkMode ? 'Light mode' : 'Dark mode' }}</span>
        </button>

        <!-- Logout — always visible (icon-only when collapsed) -->
        <button
          class="w-full flex items-center text-xs font-medium text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
          :class="collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'"
          :title="collapsed ? 'Log out' : undefined"
        >
          <LogOut class="w-4 h-4 shrink-0" />
          <span v-if="!collapsed">Log out</span>
        </button>

        <!-- Desktop collapse toggle -->
        <button
          @click="collapsed = !collapsed"
          class="hidden sm:flex w-full items-center justify-center py-2.5 text-gray-500 hover:text-white hover:bg-white/5 transition-colors border-t border-white/10"
          :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <ChevronLeft v-if="!collapsed" class="w-4 h-4" />
          <ChevronRight v-else class="w-4 h-4" />
        </button>
      </div>
    </aside>

    <!-- ─── MAIN ─────────────────────────────────────────────────────────────── -->
    <div class="flex-1 flex flex-col overflow-hidden min-w-0">
      <!-- Top bar -->
      <header
        class="border-b px-4 sm:px-6 py-3 flex items-center gap-3 shrink-0 transition-colors duration-200"
        :class="darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'"
      >
        <!-- Mobile hamburger -->
        <button
          @click="mobileOpen = !mobileOpen"
          class="sm:hidden transition-colors -ml-1 mr-1"
          :class="darkMode ? 'text-gray-500 hover:text-gray-200' : 'text-gray-400 hover:text-gray-700'"
        >
          <X v-if="mobileOpen" class="w-5 h-5" />
          <Menu v-else class="w-5 h-5" />
        </button>
        <h1
          class="font-semibold text-sm sm:text-base transition-colors"
          :class="darkMode ? 'text-gray-100' : 'text-gray-900'"
        >{{ currentPageLabel }}</h1>
        <span class="ml-auto text-xs text-gray-400 hidden sm:block">{{ today }}</span>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" :class="darkMode ? 'content-dark' : ''"
      >

        <!-- ─── LOGIN PAGE ───────────────────────────────────────────────────── -->
        <template v-if="activePage === 'login'">
          <div class="min-h-full flex items-center justify-center py-8">
            <div class="w-full max-w-sm">
              <!-- Auth0-style card -->
              <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <!-- Header bar -->
                <div class="px-8 pt-8 pb-6 border-b border-gray-100 text-center">
                  <div
                    class="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center text-white text-lg font-bold"
                    :style="{ backgroundColor: primaryColor }"
                  >{{ clientName.charAt(0) }}</div>
                  <h2 class="text-lg font-semibold text-gray-900">Welcome back</h2>
                  <p class="text-sm text-gray-500 mt-1">Log in to {{ clientName }}</p>
                </div>

                <!-- Form fields (visual only) -->
                <div class="px-8 py-6 space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                    <input
                      type="email"
                      placeholder="you@company.com"
                      disabled
                      class="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-1.5">
                      <label class="text-sm font-medium text-gray-700">Password</label>
                      <span class="text-xs text-gray-400">Forgot password?</span>
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      disabled
                      class="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <!-- Continue button — clicking advances to dashboard -->
                  <button
                    @click="activePage = 'overview'"
                    class="w-full py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                    :style="{ backgroundColor: primaryColor }"
                  >
                    <LogIn class="w-4 h-4" />
                    Continue
                  </button>

                  <p class="text-xs text-center text-gray-400">
                    This is a preview of the Auth0 login screen.<br/>
                    <span v-if="config?.auth0Domain" class="font-mono">{{ config.auth0Domain }}</span>
                    <span v-else>Auth0 domain not yet configured.</span>
                  </p>
                </div>

                <!-- Auth0 branding footer -->
                <div class="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-1.5">
                  <svg class="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span class="text-xs text-gray-400">Secured by <span class="font-medium">Auth0</span></span>
                </div>
              </div>

              <!-- Helper note -->
              <p class="text-xs text-center text-gray-400 mt-4">Click "Continue" above to preview the dashboard →</p>
            </div>
          </div>
        </template>

        <!-- ─── OVERVIEW ─────────────────────────────────────────────────────── -->
        <template v-if="activePage === 'overview'">
          <div class="mb-6">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900">Welcome back!</h2>
            <p class="text-gray-500 text-sm mt-1">{{ today }}</p>
          </div>

          <!-- Quick Actions -->
          <div v-if="quickActions.length > 0" class="mb-8">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3 flex items-center gap-1.5">
              <Zap class="w-3.5 h-3.5" /> Quick Actions
            </h3>
            <div class="flex flex-wrap gap-3">
              <a
                v-for="action in quickActions"
                :key="action.id"
                :href="action.url"
                target="_blank"
                rel="noopener"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white shadow-sm transition-opacity hover:opacity-90"
                :style="{ backgroundColor: primaryColor }"
              >
                <ExternalLink class="w-3.5 h-3.5 shrink-0" />
                {{ action.title }}
              </a>
            </div>
          </div>

          <!-- Summary cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              v-for="card in summaryCards"
              :key="card.id"
              @click="activePage = card.id"
              class="bg-white rounded-2xl border border-gray-200 p-5 text-left hover:shadow-md transition-shadow flex items-start gap-4"
            >
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                :style="{ backgroundColor: primaryColor + '20' }"
              >
                <component :is="card.icon" class="w-5 h-5" :style="{ color: primaryColor }" />
              </div>
              <div class="min-w-0">
                <p class="font-semibold text-gray-900 text-sm">{{ card.title }}</p>
                <p class="text-gray-500 text-xs mt-0.5">{{ card.sub }}</p>
              </div>
            </button>
          </div>
        </template>

        <!-- ─── ANALYTICS ────────────────────────────────────────────────────── -->
        <template v-else-if="activePage === 'analytics'">
          <div class="space-y-4">
            <!-- Period selector -->
            <div class="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 w-fit">
              <span class="px-3 py-1 text-xs font-medium rounded text-gray-500">Today</span>
              <span class="px-3 py-1 text-xs font-medium rounded text-gray-500">Last 7 days</span>
              <span class="px-3 py-1 text-xs font-medium rounded text-white" :style="{ backgroundColor: primaryColor }">Last 30 days</span>
            </div>

            <!-- Story card -->
            <div class="bg-white rounded-xl p-5 border-l-[3px]" :style="{ borderLeftColor: primaryColor }">
              <p class="text-sm font-medium text-gray-800 leading-relaxed">142 people visited your site this month — up from last month.</p>
              <p class="text-xs text-gray-500 mt-1">Most traffic landed on your homepage. Only 18 people explored further.</p>
            </div>

            <!-- Mini bar chart mockup -->
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Weekly visitors</p>
              <div class="flex items-end gap-1.5 h-14">
                <div v-for="(h, i) in [40, 55, 35, 70]" :key="i" class="flex-1 rounded-t" :style="{ height: h + '%', backgroundColor: primaryColor }"></div>
              </div>
              <div class="flex gap-1.5 mt-1">
                <span v-for="w in ['Week 1', 'Week 2', 'Week 3', 'Week 4']" :key="w" class="flex-1 text-center text-[9px] text-gray-400">{{ w }}</span>
              </div>
            </div>

            <!-- Metric cards -->
            <div class="grid grid-cols-3 gap-3">
              <div v-for="stat in [
                { label: 'Visitors', value: '142', trend: '↑', color: '#16a34a' },
                { label: 'Page views', value: '389', trend: '↑', color: '#16a34a' },
                { label: 'Avg. time', value: '28s', trend: '→', color: '#9ca3af' }
              ]" :key="stat.label" class="bg-white border border-gray-200 rounded-xl p-3">
                <p class="text-[9px] font-medium uppercase tracking-wider text-gray-400">{{ stat.label }}</p>
                <p class="text-lg font-bold text-gray-900 mt-0.5">{{ stat.value }}</p>
                <p class="text-[10px] mt-0.5" :style="{ color: stat.color }">{{ stat.trend }} {{ stat.trend === '↑' ? 'Trending up' : 'About the same' }}</p>
              </div>
            </div>

            <!-- Funnel -->
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Visitor journey</p>
              <div class="space-y-1.5">
                <div class="flex items-center gap-2 text-xs">
                  <span class="w-28 text-gray-700 shrink-0">Visited your site</span>
                  <div class="flex-1 h-4 bg-gray-100 rounded overflow-hidden"><div class="h-full rounded" :style="{ width: '100%', backgroundColor: primaryColor }"></div></div>
                  <span class="text-gray-600 font-semibold w-8 text-right">100%</span>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  <span class="w-28 text-gray-700 shrink-0">Explored a page</span>
                  <div class="flex-1 h-4 bg-gray-100 rounded overflow-hidden"><div class="h-full rounded" style="width: 13%; min-width: 24px; background-color: #64748b"></div></div>
                  <span class="text-gray-600 font-semibold w-8 text-right">13%</span>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  <span class="w-28 text-gray-700 shrink-0">Reached {{ (config?.analyticsConversionPage ?? '/contact').replace(/^\//, '').replace(/-/g, ' ') }}</span>
                  <div class="flex-1 h-4 bg-gray-100 rounded overflow-hidden"><div class="h-full rounded" style="width: 4%; min-width: 24px; background-color: #f59e0b"></div></div>
                  <span class="text-gray-600 font-semibold w-8 text-right">4%</span>
                </div>
              </div>
            </div>

            <!-- Insight card -->
            <div class="bg-white border border-gray-200 rounded-xl p-4 flex gap-3">
              <div class="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0"></div>
              <div>
                <p class="text-xs font-semibold text-gray-800">What to focus on this month</p>
                <p class="text-xs text-gray-500 mt-1 leading-relaxed">Consistent, genuine outreach tends to compound over time. Even one new post or updated page per month keeps your site active in search results.</p>
              </div>
            </div>

            <!-- Top pages sample -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Top pages — real visitors only</p>
                <span class="text-[10px] font-medium" :style="{ color: primaryColor }">Show your own activity</span>
              </div>
              <div class="space-y-1">
                <div v-for="page in [{ path: '/', count: 112, pct: 100 }, { path: '/services', count: 24, pct: 21 }, { path: '/about', count: 18, pct: 16 }, { path: config?.analyticsConversionPage ?? '/contact', count: 6, pct: 5 }]" :key="page.path" class="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5">
                  <span class="text-xs font-mono text-gray-700 w-24 shrink-0 truncate">{{ page.path }}</span>
                  <div class="flex-1 h-1.5 bg-gray-100 rounded overflow-hidden"><div class="h-full rounded" :style="{ width: page.pct + '%', backgroundColor: primaryColor }"></div></div>
                  <span class="text-xs font-semibold text-gray-600 w-6 text-right">{{ page.count }}</span>
                </div>
              </div>
            </div>

            <!-- Referrers sample -->
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">How people found you</p>
              <div class="divide-y divide-gray-100">
                <div v-for="ref in [
                  { name: 'Direct / typed your URL', desc: 'Existing contacts, bookmarks, or word of mouth', count: 78 },
                  { name: 'Google Search', desc: 'Someone searched and found you', count: 41 },
                  { name: 'Facebook', desc: 'A post or profile link', count: 23 }
                ]" :key="ref.name" class="flex items-center justify-between py-2">
                  <div>
                    <p class="text-xs font-medium text-gray-800">{{ ref.name }}</p>
                    <p class="text-[10px] text-gray-400">{{ ref.desc }}</p>
                  </div>
                  <span class="text-xs font-semibold text-gray-600">{{ ref.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ─── CONTENT EDITORS ──────────────────────────────────────────────── -->
        <template v-else-if="activePage === 'content'">
          <div
            v-if="config?.contentEditors.filter(e => e.label && e.fields.length > 0).length === 0"
            class="text-center py-16 text-gray-400"
          >
            <FileEdit class="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p class="text-sm">No content editors configured.</p>
          </div>
          <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              v-for="editor in config!.contentEditors.filter(e => e.label && e.fields.length > 0)"
              :key="editor.id"
              class="bg-white rounded-2xl border border-gray-200 overflow-hidden"
            >
              <div class="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center" :style="{ backgroundColor: primaryColor + '20' }">
                  <FileEdit class="w-4 h-4" :style="{ color: primaryColor }" />
                </div>
                <div>
                  <h3 class="font-semibold text-sm text-gray-900">{{ editor.label }}</h3>
                  <p v-if="editor.description" class="text-xs text-gray-500">{{ editor.description }}</p>
                </div>
              </div>
              <div class="p-5 space-y-4">
                <div v-for="field in editor.fields" :key="field.id">
                  <label class="block text-xs font-medium text-gray-600 mb-1">
                    {{ field.label || field.name }}
                    <span v-if="field.required" class="text-red-400 ml-0.5">*</span>
                  </label>
                  <input
                    v-if="field.type === 'text'"
                    type="text" :placeholder="field.label" disabled
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                  <textarea
                    v-else-if="field.type === 'textarea'"
                    :placeholder="field.label" rows="3" disabled
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-400 cursor-not-allowed resize-none"
                  />
                  <div
                    v-else-if="field.type === 'image' || field.type === 'file'"
                    class="w-full px-3 py-6 rounded-lg border-2 border-dashed border-gray-200 text-xs text-gray-400 text-center"
                  >
                    Click to upload {{ field.type }}
                  </div>
                </div>
                <button
                  disabled
                  class="w-full py-2.5 rounded-xl text-sm font-medium text-white cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
                  :style="{ backgroundColor: primaryColor }"
                >
                  <FileEdit class="w-4 h-4" /> Publish Changes
                </button>
                <p class="text-xs text-gray-400 text-center -mt-2">Saves to Sanity CMS and triggers a site rebuild</p>
              </div>
            </div>
          </div>
        </template>

        <!-- ─── RESOURCES ────────────────────────────────────────────────────── -->
        <template v-else-if="activePage === 'resources'">
          <!-- Tutorial Videos -->
          <div v-if="config?.enabledWidgets.includes('tutorials') && Object.keys(videosByCategory).length > 0" class="mb-10">
            <h2 class="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4 flex items-center gap-1.5">
              <BookOpen class="w-3.5 h-3.5" /> Tutorial Videos
            </h2>
            <div v-for="(videos, category) in videosByCategory" :key="category" class="mb-6">
              <h3 class="text-sm font-semibold text-gray-700 mb-3">{{ category }}</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <a
                  v-for="video in videos.filter(v => v.title && hasVideoContent(v))"
                  :key="video.id"
                  :href="getVideoUrl(video)"
                  target="_blank" rel="noopener"
                  class="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow block"
                >
                  <div class="aspect-video bg-gray-100 relative overflow-hidden">
                    <img
                      v-if="getVideoThumbnail(video)"
                      :src="getVideoThumbnail(video)!"
                      :alt="video.title"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <BookOpen class="w-8 h-8 text-gray-300" />
                    </div>
                    <div class="absolute inset-0 flex items-center justify-center">
                      <div class="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                        <svg class="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </div>
                  </div>
                  <div class="p-3">
                    <p class="font-medium text-gray-900 text-sm line-clamp-2">{{ video.title }}</p>
                    <p v-if="video.description" class="text-xs text-gray-500 mt-1 line-clamp-2">{{ video.description }}</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <!-- Helpful Links -->
          <div v-if="config?.enabledWidgets.includes('links') && config.links.filter(l => !!l.description && l.title && l.url).length > 0">
            <h2 class="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4 flex items-center gap-1.5">
              <Link2 class="w-3.5 h-3.5" /> Helpful Links
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <a
                v-for="link in config!.links.filter(l => !!l.description && l.title && l.url)"
                :key="link.id"
                :href="link.url"
                target="_blank" rel="noopener"
                class="bg-white rounded-2xl border border-gray-200 p-4 flex items-start gap-3 hover:shadow-md transition-shadow"
              >
                <span class="text-2xl leading-none mt-0.5">{{ link.emoji || '🔗' }}</span>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900 text-sm">{{ link.title }}</p>
                  <p v-if="link.description" class="text-xs text-gray-500 mt-0.5 line-clamp-2">{{ link.description }}</p>
                </div>
                <ExternalLink class="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
              </a>
            </div>
          </div>

          <!-- Empty -->
          <div v-if="Object.keys(videosByCategory).length === 0 && (!config?.links || config.links.filter(l => !!l.description && l.title && l.url).length === 0)" class="text-center py-16 text-gray-400">
            <BookOpen class="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p class="text-sm">No resources configured yet.</p>
          </div>
        </template>

        <!-- ─── BILLING ────────────────────────────────────────────────────────── -->
        <template v-else-if="activePage === 'billing'">
          <div class="max-w-2xl">
            <div class="mb-6">
              <h2 class="text-xl font-bold text-gray-900">Billing & Payments</h2>
              <p class="text-gray-500 text-sm mt-1">Manage your subscription, payment method, and invoices</p>
            </div>

            <!-- Subscription card -->
            <div class="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Subscription</p>
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="w-2 h-2 rounded-full bg-green-500"></span>
                    <span class="text-xs font-medium text-green-600">Active</span>
                  </div>
                  <p class="text-sm font-semibold text-gray-900">Passive Maintenance — Monthly</p>
                  <p class="text-xs text-gray-500 mt-0.5">Next billing: April 1, 2026</p>
                </div>
                <p class="text-lg font-bold text-gray-900">$300<span class="text-xs font-normal text-gray-400">/mo</span></p>
              </div>
              <button
                disabled
                class="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white cursor-not-allowed opacity-60"
                :style="{ backgroundColor: primaryColor }"
                title="Available on live dashboard"
              >
                Manage Subscription
                <ExternalLink class="w-3.5 h-3.5" />
              </button>
              <p class="text-[10px] text-gray-400 mt-1.5">Opens Stripe Customer Portal</p>
            </div>

            <!-- Pending charges card -->
            <div v-if="config?.billing?.showPendingCharges !== false" class="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Pending Charges</p>
              <div class="space-y-3">
                <div class="flex items-center justify-between text-sm">
                  <div>
                    <p class="font-medium text-gray-900">Day rate — Homepage redesign</p>
                    <p class="text-xs text-gray-400">Mar 5</p>
                  </div>
                  <div class="text-right">
                    <p class="font-medium text-gray-900">$650.00</p>
                    <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Open</span>
                  </div>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <div>
                    <p class="font-medium text-gray-900">Rush delivery fee</p>
                    <p class="text-xs text-gray-400">Mar 3</p>
                  </div>
                  <div class="text-right">
                    <p class="font-medium text-gray-900">$150.00</p>
                    <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Open</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <p class="text-sm font-semibold text-gray-900">Total pending: $800.00</p>
                <button
                  disabled
                  class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white cursor-not-allowed opacity-60"
                  :style="{ backgroundColor: primaryColor }"
                  title="Available on live dashboard"
                >
                  Pay Now
                  <ExternalLink class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- Recent payments card -->
            <div class="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Recent Payments</p>
              <div class="space-y-3">
                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center gap-2">
                    <CheckCircle2 class="w-4 h-4 text-green-500 shrink-0" />
                    <div>
                      <p class="font-medium text-gray-900">Maintenance — Mar 2026</p>
                      <p class="text-xs text-gray-400">Mar 1</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-medium text-gray-900">$300.00</p>
                    <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Paid</span>
                  </div>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center gap-2">
                    <CheckCircle2 class="w-4 h-4 text-green-500 shrink-0" />
                    <div>
                      <p class="font-medium text-gray-900">Maintenance — Feb 2026</p>
                      <p class="text-xs text-gray-400">Feb 1</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-medium text-gray-900">$300.00</p>
                    <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Paid</span>
                  </div>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center gap-2">
                    <CheckCircle2 class="w-4 h-4 text-green-500 shrink-0" />
                    <div>
                      <p class="font-medium text-gray-900">Day rate — Logo refresh</p>
                      <p class="text-xs text-gray-400">Jan 15</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-medium text-gray-900">$650.00</p>
                    <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Paid</span>
                  </div>
                </div>
              </div>
              <button
                disabled
                class="mt-4 flex items-center gap-1.5 text-sm font-medium cursor-not-allowed opacity-60"
                :style="{ color: primaryColor }"
                title="Available on live dashboard"
              >
                View All Invoices
                <ExternalLink class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Payment method card -->
            <div class="bg-white rounded-2xl border border-gray-200 p-5">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Payment Method</p>
              <div class="flex items-center gap-3">
                <CreditCard class="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p class="text-sm font-medium text-gray-900">Visa ending in 4242</p>
                  <p class="text-xs text-gray-500">Expires 12/27</p>
                </div>
              </div>
              <button
                disabled
                class="mt-3 flex items-center gap-1.5 text-sm font-medium cursor-not-allowed opacity-60"
                :style="{ color: primaryColor }"
                title="Available on live dashboard"
              >
                Update Payment Method
                <ExternalLink class="w-3.5 h-3.5" />
              </button>
            </div>

            <p class="text-xs text-gray-400 text-center mt-4">Preview only — all actions will be functional on the live dashboard via Stripe Customer Portal.</p>
          </div>
        </template>

        <!-- ─── CONTENT KIT ──────────────────────────────────────────────────── -->
        <template v-else-if="activePage === 'contentKit'">
          <div class="max-w-2xl">
            <div class="mb-6">
              <h2 class="text-xl font-bold text-gray-900">Content Kit</h2>
              <p class="text-gray-500 text-sm mt-1">
                {{ config?.contentKit?.welcomeMessage || 'Help us build the perfect website for you! Fill out each section below with as much detail as you can.' }}
              </p>
            </div>

            <!-- Progress bar -->
            <div class="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
              <div class="flex items-center justify-between mb-2">
                <p class="text-xs font-semibold text-gray-500">Overall Progress</p>
                <p class="text-xs font-bold" :style="{ color: primaryColor }">2 of {{ config?.contentKit?.sections.filter(s => s.enabled).length ?? 7 }} sections</p>
              </div>
              <div class="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                <div class="h-full rounded-full transition-all" :style="{ width: '28%', backgroundColor: primaryColor }" />
              </div>
            </div>

            <!-- Section cards -->
            <div class="space-y-3">
              <button
                v-for="(section, idx) in (config?.contentKit?.sections ?? []).filter(s => s.enabled)"
                :key="section.id"
                class="w-full bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4 text-left hover:shadow-md transition-shadow"
              >
                <!-- Status icon -->
                <div
                  v-if="idx < 2"
                  class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-green-100"
                >
                  <CheckCircle2 class="w-4 h-4 text-green-600" />
                </div>
                <div
                  v-else
                  class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gray-100"
                >
                  <span class="text-xs font-bold text-gray-400">{{ idx + 1 }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-semibold text-gray-900">{{ section.label }}</p>
                    <span
                      v-if="section.required"
                      class="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      :style="{ backgroundColor: primaryColor + '20', color: primaryColor }"
                    >Required</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-0.5">{{ section.description }}</p>
                </div>
                <ChevronDown class="w-4 h-4 text-gray-300 shrink-0 -rotate-90" />
              </button>
            </div>

            <!-- Example expanded section: Your Business -->
            <div class="mt-6 bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div class="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center" :style="{ backgroundColor: primaryColor + '20' }">
                  <ClipboardList class="w-4 h-4" :style="{ color: primaryColor }" />
                </div>
                <div>
                  <h3 class="font-semibold text-sm text-gray-900">Your Business</h3>
                  <p class="text-xs text-gray-500">Tell us about your business</p>
                </div>
              </div>
              <div class="p-5 space-y-4">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Business Name <span class="text-red-400">*</span></label>
                  <input type="text" disabled placeholder="e.g. Acme Web Design" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Tagline</label>
                  <input type="text" disabled placeholder="A short phrase that captures what you do" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Industry</label>
                  <input type="text" disabled placeholder="e.g. Home Services, Healthcare, Retail" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Years in Business</label>
                    <input type="text" disabled placeholder="e.g. 5" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Location</label>
                    <input type="text" disabled placeholder="City, State" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                  </div>
                </div>

                <!-- Brand personality chips preview -->
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-2">Brand Personality <span class="text-xs font-normal text-gray-400">(pick up to {{ config?.contentKit?.maxPersonalityPicks ?? 4 }})</span></label>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="(p, i) in BRAND_PERSONALITY_OPTIONS"
                      :key="p"
                      class="px-3 py-1.5 rounded-full text-xs font-medium cursor-not-allowed transition-colors"
                      :style="i < 2
                        ? { backgroundColor: primaryColor, color: '#fff' }
                        : { backgroundColor: '#f3f4f6', color: '#6b7280' }"
                    >{{ p }}</span>
                  </div>
                </div>

                <!-- File upload mockup -->
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Logo Upload</label>
                  <div class="w-full px-4 py-8 rounded-lg border-2 border-dashed border-gray-200 text-center cursor-not-allowed">
                    <Upload class="w-6 h-6 text-gray-300 mx-auto mb-2" />
                    <p class="text-xs text-gray-400">Drag & drop or click to upload</p>
                    <p class="text-[10px] text-gray-300 mt-1">PNG, JPG, SVG up to 5MB</p>
                  </div>
                </div>

                <!-- Skip / Save buttons -->
                <div class="flex items-center justify-between pt-2">
                  <button disabled class="text-xs font-medium cursor-not-allowed" :style="{ color: primaryColor }">Skip for now</button>
                  <button
                    disabled
                    class="px-5 py-2 rounded-xl text-sm font-medium text-white cursor-not-allowed opacity-60"
                    :style="{ backgroundColor: primaryColor }"
                  >Save & Continue</button>
                </div>
              </div>
            </div>

            <p class="text-xs text-gray-400 text-center mt-4">Preview only — auto-save and submissions will be functional on the live dashboard.</p>
          </div>
        </template>

        <!-- ─── CONTACT & SUPPORT ─────────────────────────────────────────────── -->
        <template v-else-if="activePage === 'contact'">
          <div class="max-w-xl">
            <div class="mb-6">
              <h2 class="text-xl font-bold text-gray-900">Contact Your Developer</h2>
              <p class="text-gray-500 text-sm mt-1">We typically respond within 1–2 business days.</p>
            </div>

            <!-- Success state -->
            <div
              v-if="contactSubmitted"
              class="bg-white rounded-2xl border border-green-200 p-8 text-center"
            >
              <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 class="w-7 h-7 text-green-600" />
              </div>
              <h3 class="font-semibold text-gray-900 text-lg mb-1">Message sent!</h3>
              <p class="text-gray-500 text-sm">Your developer has been notified and will follow up soon.</p>
            </div>

            <!-- Contact form -->
            <form v-else @submit.prevent="submitContact" class="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              <!-- Category -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Request Type</label>
                <select
                  v-model="contactCategory"
                  class="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white"
                  :style="{ '--tw-ring-color': primaryColor }"
                >
                  <option v-for="cat in CONTACT_CATEGORIES" :key="cat.value" :value="cat.value">
                    {{ cat.label }}
                  </option>
                </select>
              </div>

              <!-- Subject -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Subject <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="contactSubject"
                  type="text"
                  placeholder="Brief summary of your request"
                  required
                  class="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                  :style="{ '--tw-ring-color': primaryColor }"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Description <span class="text-red-400">*</span>
                </label>
                <textarea
                  v-model="contactDescription"
                  rows="5"
                  placeholder="Describe the issue or request in detail. Include URLs, steps to reproduce, or any relevant context."
                  required
                  class="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 resize-none"
                  :style="{ '--tw-ring-color': primaryColor }"
                />
              </div>

              <!-- Name + Email row -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
                  <input
                    v-model="contactName"
                    type="text"
                    placeholder="Name"
                    class="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                    :style="{ '--tw-ring-color': primaryColor }"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    v-model="contactEmail"
                    type="email"
                    placeholder="you@example.com"
                    class="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                    :style="{ '--tw-ring-color': primaryColor }"
                  />
                </div>
              </div>

              <!-- Submit -->
              <button
                type="submit"
                :disabled="contactSubmitting || !contactSubject.trim() || !contactDescription.trim()"
                class="w-full py-3 rounded-xl font-medium text-sm text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                :style="{ backgroundColor: primaryColor }"
              >
                <Send class="w-4 h-4" />
                {{ contactSubmitting ? 'Sending…' : 'Send Message' }}
              </button>

              <!-- Preview note -->
              <p v-if="!config?.contactWebhookUrl" class="text-xs text-gray-400 text-center">
                Preview mode — submissions will be active on your live dashboard.
              </p>
            </form>
          </div>
        </template>

      </main>

      <!-- Powered by footer -->
      <footer
        class="shrink-0 border-t px-6 py-2 flex items-center justify-center transition-colors duration-200"
        :class="darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'"
      >
        <p class="text-xs" :class="darkMode ? 'text-gray-600' : 'text-gray-400'">
          Powered by <span class="font-medium">Phifer Web Solutions</span>
        </p>
      </footer>
    </div>

  </div>
</template>

<style scoped>
/* ── Dark mode overrides for dashboard content ─────────────────────────────
   .content-dark is applied to <main> when darkMode is active.
   Scoped selectors have higher specificity than Tailwind classes, so no
   !important needed.
──────────────────────────────────────────────────────────────────────────── */

/* Text */
.content-dark .text-gray-900 { color: #f3f4f6; }  /* gray-100 */
.content-dark .text-gray-700 { color: #e5e7eb; }  /* gray-200 */
.content-dark .text-gray-600 { color: #d1d5db; }  /* gray-300 */
.content-dark .text-gray-500 { color: #9ca3af; }  /* gray-400 */
.content-dark .text-gray-400 { color: #6b7280; }  /* gray-500 */

/* Card / surface backgrounds */
.content-dark .bg-white        { background-color: #1f2937; }  /* gray-800 */
.content-dark .bg-gray-50      { background-color: #111827; }  /* gray-900 */
.content-dark .bg-gray-100     { background-color: #1f2937; }  /* gray-800 */

/* Borders */
.content-dark .border-gray-200 { border-color: #374151; }  /* gray-700 */
.content-dark .border-gray-100 { border-color: #1f2937; }  /* gray-800 */
.content-dark .border-green-200 { border-color: #065f46; }  /* keep success green */

/* Form elements in contact page */
.content-dark select { background-color: #374151; color: #f3f4f6; border-color: #4b5563; }
.content-dark input[type="text"],
.content-dark input[type="email"],
.content-dark textarea { background-color: #374151; color: #f3f4f6; border-color: #4b5563; }
.content-dark input[type="text"]::placeholder,
.content-dark input[type="email"]::placeholder,
.content-dark textarea::placeholder { color: #6b7280; }

/* Card hover shadows */
.content-dark .hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.6), 0 2px 4px -2px rgba(0,0,0,0.4);
}
</style>
