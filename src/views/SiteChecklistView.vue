<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft, ArrowRight, Check, Copy, ChevronDown, ChevronUp,
  FlaskConical, Globe, ExternalLink, Layout, Layers, FileCode, Download
} from 'lucide-vue-next'
import { useCompositionStore } from '../stores/composition'
import { useWorkflowStore } from '../stores/workflow'
import { BUSINESS_TYPES } from '../data/siteBuilderData'
import { isAppProjectType } from '../types/registry'

const router = useRouter()
const composition = useCompositionStore()
const workflow = useWorkflowStore()

const client = computed(() => workflow.clientInfo)
const sb = computed(() => composition.siteBuilder)

const isAppMode = computed(() => isAppProjectType(sb.value.businessType))

// ── Confirmed toggles — persisted in store so navigation doesn't reset them ──
const WEBSITE_KEYS = ['schema', 'pageMeta', 'navStructure', 'components', 'sanitySchema', 'legalPages', 'envExample']
const APP_KEYS = ['routerConfig', 'piniaStore', 'sanitySchema', 'componentManifest', 'envExample']

const websiteConfirmed = computed(() => sb.value.checklistConfirmedWebsite)
const appConfirmed = computed(() => sb.value.checklistConfirmedApp)

// ── Expanded panels ───────────────────────────────────────────────────────────
const websiteExpanded = ref<Set<string>>(new Set([
  'schema', 'pageMeta', 'navStructure', 'components', 'sanitySchema', 'legalPages', 'envExample'
]))
const appExpanded = ref<Set<string>>(new Set([
  'routerConfig', 'piniaStore', 'sanitySchema', 'componentManifest', 'envExample'
]))
const expanded = computed(() => isAppMode.value ? appExpanded.value : websiteExpanded.value)

function togglePanel(id: string) {
  const set = isAppMode.value ? appExpanded.value : websiteExpanded.value
  if (set.has(id)) set.delete(id)
  else set.add(id)
}

// ── All confirmed ─────────────────────────────────────────────────────────────
const allConfirmed = computed(() => {
  const conf = isAppMode.value ? sb.value.checklistConfirmedApp : sb.value.checklistConfirmedWebsite
  const keys = isAppMode.value ? APP_KEYS : WEBSITE_KEYS
  return keys.every(k => !!conf[k])
})

const confirmedCount = computed(() => {
  const conf = isAppMode.value ? sb.value.checklistConfirmedApp : sb.value.checklistConfirmedWebsite
  const keys = isAppMode.value ? APP_KEYS : WEBSITE_KEYS
  return keys.filter(k => !!conf[k]).length
})

const totalPanels = computed(() => (isAppMode.value ? APP_KEYS : WEBSITE_KEYS).length)

// ── Website mode outputs ──────────────────────────────────────────────────────

const schemaOutput = computed(() => {
  const type = BUSINESS_TYPES.find(t => t.id === sb.value.businessType)
  const obj: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': type?.schemaType ?? 'Organization',
    'name': client.value?.name ?? 'Your Business',
    'url': `https://${client.value?.domain ?? 'example.com'}`
  }
  if (client.value?.contactEmail) obj['email'] = client.value.contactEmail
  return JSON.stringify(obj, null, 2)
})

const nonLegalPages = computed(() =>
  sb.value.sitemapPages.filter(p => !p.isLegal)
)

const primaryNavPages = computed(() =>
  sb.value.sitemapPages.filter(p => p.nav === 'primary' || p.nav === 'both')
)

const footerNavPages = computed(() =>
  sb.value.sitemapPages.filter(p => p.nav === 'footer' || p.nav === 'both')
)

const sanityDocTypes = computed(() => {
  const base = ['siteSettings', 'navigation', 'page', 'legalPage']
  const fromComponents = composition.mergedSchemaRequirements.map(r => r.documentType)
  return [...new Set([...base, ...fromComponents])]
})

const legalStatus = computed(() => {
  const lc = sb.value.legalContent
  return [
    { label: 'Privacy Policy', key: 'privacyPolicy', done: !!lc.privacyPolicy },
    { label: 'Terms & Conditions', key: 'termsConditions', done: !!lc.termsConditions },
    { label: 'Accessibility Statement', key: 'accessibilityStatement', done: !!lc.accessibilityStatement },
    { label: 'Cookie Policy', key: 'cookiePolicy', done: !!lc.cookiePolicy }
  ]
})

// ── .env.example — editable config ───────────────────────────────────────────
// Local reactive copy — saved to store on blur
const envLocal = ref({
  sanityProjectId: sb.value.envConfig?.sanityProjectId ?? '',
  sanityDataset: sb.value.envConfig?.sanityDataset ?? 'production',
  siteUrl: sb.value.envConfig?.siteUrl || (client.value?.domain ? `https://${client.value.domain}` : ''),
  auth0Domain: sb.value.envConfig?.auth0Domain ?? '',
  auth0ClientId: sb.value.envConfig?.auth0ClientId ?? ''
})

function saveEnvField() {
  composition.setEnvConfig({ ...envLocal.value })
}

const websiteEnvOutput = computed(() => {
  const cfg = envLocal.value
  const siteUrl = cfg.siteUrl || (client.value?.domain ? `https://${client.value.domain}` : 'https://example.com')
  const lines: string[] = [
    '# Sanity CMS',
    `VITE_SANITY_PROJECT_ID=${cfg.sanityProjectId}`,
    `VITE_SANITY_DATASET=${cfg.sanityDataset || 'production'}`,
    'VITE_SANITY_API_VERSION=2024-01-01',
    '',
    '# Site',
    `VITE_SITE_URL=${siteUrl}`,
  ]
  if (cfg.auth0Domain || cfg.auth0ClientId) {
    lines.push('', '# Auth0')
    lines.push(`VITE_AUTH0_DOMAIN=${cfg.auth0Domain}`)
    lines.push(`VITE_AUTH0_CLIENT_ID=${cfg.auth0ClientId}`)
  } else {
    lines.push('', '# Auth0 (if applicable)', '# VITE_AUTH0_DOMAIN=', '# VITE_AUTH0_CLIENT_ID=')
  }
  return lines.join('\n')
})

// .env.example — template version, no real values (safe to commit)
const websiteEnvExampleOutput = computed(() => {
  const dataset = envLocal.value.sanityDataset || 'production'
  return [
    '# Sanity CMS',
    'VITE_SANITY_PROJECT_ID=',
    `VITE_SANITY_DATASET=${dataset}`,
    'VITE_SANITY_API_VERSION=2024-01-01',
    '',
    '# Site',
    'VITE_SITE_URL=',
    '',
    '# Auth0 (if applicable)',
    '# VITE_AUTH0_DOMAIN=',
    '# VITE_AUTH0_CLIENT_ID='
  ].join('\n')
})

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── App mode outputs ──────────────────────────────────────────────────────────

const routerConfigOutput = computed(() => {
  const buildNow = sb.value.appScreens.filter(s => !s.isEnrichOnly)
  if (buildNow.length === 0) return '// No screens defined yet. Add screens in the App Screens step.'
  const routeLines = buildNow.map(s => {
    const name = s.name.toLowerCase().replace(/\s+/g, '-')
    const compName = s.name.replace(/\s+/g, '') + 'View'
    return `  {\n    path: '${s.route}',\n    name: '${name}',\n    component: () => import('../views/${compName}.vue')\n  }`
  }).join(',\n')
  return `import { createRouter, createWebHistory } from 'vue-router'\n\nconst router = createRouter({\n  history: createWebHistory(),\n  routes: [\n${routeLines}\n  ]\n})\n\nexport default router`
})

const piniaStoreOutput = computed(() => {
  const preamble = `import { defineStore } from 'pinia'\nimport { ref } from 'vue'\n\n`
  if (sb.value.dataModel.length === 0) return preamble + '// No data entities defined yet. Add entities in the Data Model step.'
  const stores = sb.value.dataModel.map(entity => {
    const storeName = 'use' + entity.name.replace(/\s+/g, '') + 'Store'
    const storeKey = entity.name.toLowerCase().replace(/\s+/g, '-')
    const fieldComments = entity.fields.length > 0
      ? entity.fields.map(f => `  //   ${f.name}: ${f.type}${f.required ? ' (required)' : ''}`).join('\n')
      : '  //   (no fields defined)'
    return `// ${entity.name}\nexport const ${storeName} = defineStore('${storeKey}', () => {\n  const items = ref([])\n  // Fields:\n${fieldComments}\n  return { items }\n})`
  }).join('\n\n')
  return preamble + stores
})

const appSanityDocTypes = computed(() =>
  sb.value.dataModel.map(e => e.name.toLowerCase().replace(/\s+/g, ''))
)

const componentManifestOutput = computed(() => {
  if (sb.value.appScreens.length === 0) return '// No screens defined yet.'
  const header = 'Status       Name                   Route                     View Type    Component\n' +
    '─'.repeat(95)
  const rows = sb.value.appScreens.map(s => {
    const status = s.isEnrichOnly ? '[Later]     ' : '[Build Now]  '
    const name = s.name.padEnd(22)
    const route = s.route.padEnd(25)
    const viewType = s.viewType.padEnd(12)
    const compName = s.name.replace(/\s+/g, '') + 'View.vue'
    return `${status} ${name} ${route} ${viewType} ${compName}`
  }).join('\n')
  return `${header}\n${rows}`
})

const appEnvExample = computed(() => {
  const name = client.value?.name ?? 'My App'
  return [
    `# ${name} — Environment Variables`,
    '',
    '# App',
    `VITE_APP_NAME="${name}"`,
    'VITE_APP_ENV=development',
    '',
    '# Sanity CMS (if used for content)',
    '# VITE_SANITY_PROJECT_ID=',
    '# VITE_SANITY_DATASET=production',
    '# VITE_SANITY_API_VERSION=2024-01-01',
    '',
    '# Auth0 (if authentication required)',
    '# VITE_AUTH0_DOMAIN=',
    '# VITE_AUTH0_CLIENT_ID='
  ].join('\n')
})

// ── Go Public ─────────────────────────────────────────────────────────────────
function toggleIsPublic() {
  composition.setIsPublic(!sb.value.isPublic)
}

// ── Actions ───────────────────────────────────────────────────────────────────
function copyText(text: string) {
  navigator.clipboard.writeText(text).catch(() => {})
}

function complete() {
  workflow.completeStep('site')
  router.push('/cms')
}
</script>

<template>
  <div class="p-6 lg:p-8 max-w-3xl">
    <!-- Back -->
    <button
      @click="router.push(isAppMode ? '/site/data-model' : '/site/legal')"
      class="flex items-center gap-1.5 text-sm mb-6 transition-colors"
      :style="{ color: 'var(--theme-text-secondary)' }"
    >
      <ArrowLeft class="w-4 h-4" />
      {{ isAppMode ? 'Back to Data Model' : 'Back to Legal Pages' }}
    </button>

    <div class="mb-8">
      <div class="flex items-center gap-2 mb-1">
        <p class="text-xs font-semibold uppercase tracking-widest" :style="{ color: isAppMode ? 'var(--theme-warning)' : 'var(--theme-primary)' }">Step 2e</p>
        <span
          v-if="composition.siteBuilder.projectMode"
          class="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
          :style="{ backgroundColor: 'var(--theme-warning)', color: 'var(--theme-text-inverse)' }"
        >
          <FlaskConical class="w-3 h-3" />
          Project Mode
        </span>
      </div>
      <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">Generated Outputs</h1>
      <p class="mt-1" :style="{ color: 'var(--theme-text-secondary)' }">
        {{ isAppMode
          ? 'Review the generated app scaffolding from your screens and data model. Confirm all sections before completing.'
          : 'Review each output assembled from your setup. Edit inline where needed, then confirm each section.'
        }}
      </p>
    </div>

    <!-- ═══════════════════════════════════════════════════════ WEBSITE MODE ══ -->
    <template v-if="!isAppMode">
      <div class="space-y-3 mb-8">

        <!-- 1 — Schema JSON-LD -->
        <div class="rounded-xl border overflow-hidden" :style="{ borderColor: websiteConfirmed.schema ? 'var(--theme-success)' : 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }">
          <div
            class="flex items-center justify-between px-4 py-3 cursor-pointer"
            :style="{ backgroundColor: websiteConfirmed.schema ? 'var(--theme-success-light)' : 'var(--theme-bg-card)' }"
            @click="togglePanel('schema')"
          >
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                :style="websiteConfirmed.schema ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
              ><Check class="w-3 h-3" /></div>
              <div>
                <p class="font-semibold text-sm" :style="{ color: 'var(--theme-text-primary)' }">Schema JSON-LD Block</p>
                <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Generated from business type and client info.</p>
              </div>
            </div>
            <ChevronUp v-if="expanded.has('schema')" class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
            <ChevronDown v-else class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
          </div>
          <div v-if="expanded.has('schema')" class="border-t" :style="{ borderColor: 'var(--theme-border)' }">
            <div class="relative">
              <pre class="p-4 text-xs font-mono overflow-x-auto" :style="{ backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-primary)' }">{{ schemaOutput }}</pre>
              <button @click="copyText(schemaOutput)" class="absolute top-2 right-2 p-1.5 rounded-lg" :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }" title="Copy"><Copy class="w-3.5 h-3.5" /></button>
            </div>
            <div class="px-4 py-3 flex justify-end border-t" :style="{ borderColor: 'var(--theme-border)' }">
              <button @click="composition.toggleChecklistConfirmed('website', 'schema')" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :style="websiteConfirmed.schema ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-secondary)' }">
                <Check class="w-3.5 h-3.5" />
                {{ websiteConfirmed.schema ? 'Confirmed' : 'Mark Confirmed' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 2 — Page Meta Tags (editable) -->
        <div class="rounded-xl border overflow-hidden" :style="{ borderColor: websiteConfirmed.pageMeta ? 'var(--theme-success)' : 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }">
          <div
            class="flex items-center justify-between px-4 py-3 cursor-pointer"
            :style="{ backgroundColor: websiteConfirmed.pageMeta ? 'var(--theme-success-light)' : 'var(--theme-bg-card)' }"
            @click="togglePanel('pageMeta')"
          >
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                :style="websiteConfirmed.pageMeta ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
              ><Check class="w-3 h-3" /></div>
              <div>
                <p class="font-semibold text-sm" :style="{ color: 'var(--theme-text-primary)' }">Page Meta Tags</p>
                <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Edit title and description for each non-legal page.</p>
              </div>
            </div>
            <ChevronUp v-if="expanded.has('pageMeta')" class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
            <ChevronDown v-else class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
          </div>
          <div v-if="expanded.has('pageMeta')" class="border-t" :style="{ borderColor: 'var(--theme-border)' }">
            <div class="divide-y" :style="{ borderColor: 'var(--theme-border)' }">
              <div
                v-for="page in nonLegalPages"
                :key="page.id"
                class="px-4 py-3 space-y-2"
                :style="{ backgroundColor: 'var(--theme-bg-secondary)' }"
              >
                <!-- Title (read-only pattern) -->
                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold w-16 shrink-0" :style="{ color: 'var(--theme-text-muted)' }">TITLE</span>
                  <span class="text-xs font-mono" :style="{ color: 'var(--theme-text-primary)' }">
                    {{ page.name }} | {{ client?.name ?? 'Your Business' }}
                  </span>
                  <span class="text-xs font-mono" :style="{ color: 'var(--theme-text-muted)' }">{{ page.slug }}</span>
                </div>
                <!-- Description (editable) -->
                <div class="flex items-start gap-2">
                  <span class="text-xs font-semibold w-16 shrink-0 pt-2" :style="{ color: 'var(--theme-text-muted)' }">DESC</span>
                  <textarea
                    :value="page.metaDescription ?? ''"
                    @input="(e) => composition.updateSitemapPage(page.id, { metaDescription: (e.target as HTMLTextAreaElement).value })"
                    rows="2"
                    placeholder="Write a 150–160 character description for this page..."
                    class="flex-1 text-xs rounded-lg px-2.5 py-2 resize-none border outline-none transition-colors"
                    :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }"
                  />
                </div>
              </div>
            </div>
            <div class="px-4 py-3 flex justify-end border-t" :style="{ borderColor: 'var(--theme-border)' }">
              <button @click="composition.toggleChecklistConfirmed('website', 'pageMeta')" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :style="websiteConfirmed.pageMeta ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-secondary)' }">
                <Check class="w-3.5 h-3.5" />
                {{ websiteConfirmed.pageMeta ? 'Confirmed' : 'Mark Confirmed' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 3 — Nav Structure -->
        <div class="rounded-xl border overflow-hidden" :style="{ borderColor: websiteConfirmed.navStructure ? 'var(--theme-success)' : 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }">
          <div
            class="flex items-center justify-between px-4 py-3 cursor-pointer"
            :style="{ backgroundColor: websiteConfirmed.navStructure ? 'var(--theme-success-light)' : 'var(--theme-bg-card)' }"
            @click="togglePanel('navStructure')"
          >
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                :style="websiteConfirmed.navStructure ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
              ><Check class="w-3 h-3" /></div>
              <div>
                <p class="font-semibold text-sm" :style="{ color: 'var(--theme-text-primary)' }">Nav Structure</p>
                <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Primary and footer nav assignments from sitemap.</p>
              </div>
            </div>
            <ChevronUp v-if="expanded.has('navStructure')" class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
            <ChevronDown v-else class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
          </div>
          <div v-if="expanded.has('navStructure')" class="border-t" :style="{ borderColor: 'var(--theme-border)' }">
            <div class="grid grid-cols-2 divide-x" :style="{ borderColor: 'var(--theme-border)' }">
              <div class="p-4" :style="{ backgroundColor: 'var(--theme-bg-secondary)' }">
                <p class="text-xs font-semibold mb-2" :style="{ color: 'var(--theme-text-secondary)' }">Primary Nav</p>
                <ol class="space-y-1">
                  <li v-for="(page, i) in primaryNavPages" :key="page.id" class="flex items-center gap-2 text-sm" :style="{ color: 'var(--theme-text-primary)' }">
                    <span class="text-xs w-4" :style="{ color: 'var(--theme-text-muted)' }">{{ i + 1 }}.</span>{{ page.name }}
                  </li>
                  <li v-if="primaryNavPages.length === 0" class="text-xs italic" :style="{ color: 'var(--theme-text-muted)' }">None assigned</li>
                </ol>
              </div>
              <div class="p-4" :style="{ backgroundColor: 'var(--theme-bg-secondary)' }">
                <p class="text-xs font-semibold mb-2" :style="{ color: 'var(--theme-text-secondary)' }">Footer Nav</p>
                <ol class="space-y-1">
                  <li v-for="(page, i) in footerNavPages" :key="page.id" class="flex items-center gap-2 text-sm" :style="{ color: 'var(--theme-text-primary)' }">
                    <span class="text-xs w-4" :style="{ color: 'var(--theme-text-muted)' }">{{ i + 1 }}.</span>{{ page.name }}
                  </li>
                  <li v-if="footerNavPages.length === 0" class="text-xs italic" :style="{ color: 'var(--theme-text-muted)' }">None assigned</li>
                </ol>
              </div>
            </div>
            <div class="px-4 py-3 flex items-center justify-between border-t" :style="{ borderColor: 'var(--theme-border)' }">
              <button
                @click="router.push('/site/sitemap')"
                class="flex items-center gap-1.5 text-xs transition-colors"
                :style="{ color: 'var(--theme-primary)' }"
              >
                <ExternalLink class="w-3.5 h-3.5" />
                Edit Sitemap
              </button>
              <button @click="composition.toggleChecklistConfirmed('website', 'navStructure')" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :style="websiteConfirmed.navStructure ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-secondary)' }">
                <Check class="w-3.5 h-3.5" />
                {{ websiteConfirmed.navStructure ? 'Confirmed' : 'Mark Confirmed' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 4 — Component Setup (header / footer / main) -->
        <div class="rounded-xl border overflow-hidden" :style="{ borderColor: websiteConfirmed.components ? 'var(--theme-success)' : 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }">
          <div
            class="flex items-center justify-between px-4 py-3 cursor-pointer"
            :style="{ backgroundColor: websiteConfirmed.components ? 'var(--theme-success-light)' : 'var(--theme-bg-card)' }"
            @click="togglePanel('components')"
          >
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                :style="websiteConfirmed.components ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
              ><Check class="w-3 h-3" /></div>
              <div>
                <p class="font-semibold text-sm" :style="{ color: 'var(--theme-text-primary)' }">Component Setup</p>
                <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Header, footer, and default page template selections.</p>
              </div>
            </div>
            <ChevronUp v-if="expanded.has('components')" class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
            <ChevronDown v-else class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
          </div>
          <div v-if="expanded.has('components')" class="border-t" :style="{ borderColor: 'var(--theme-border)' }">
            <div class="divide-y" :style="{ borderColor: 'var(--theme-border)' }">

              <!-- Header -->
              <div class="flex items-center justify-between px-4 py-3" :style="{ backgroundColor: 'var(--theme-bg-secondary)' }">
                <div class="flex items-center gap-3">
                  <Layout class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
                  <div>
                    <p class="text-sm font-medium" :style="{ color: 'var(--theme-text-primary)' }">Header</p>
                    <p v-if="composition.selectedHeaderVariant" class="text-xs font-mono" :style="{ color: 'var(--theme-success)' }">
                      {{ composition.selectedHeaderVariant.name }}
                    </p>
                    <p v-else class="text-xs italic" :style="{ color: 'var(--theme-warning)' }">Not selected</p>
                  </div>
                </div>
                <button @click="router.push('/site/header?returnTo=/site/checklist')" class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                  :style="{ color: 'var(--theme-primary)', backgroundColor: 'var(--theme-primary-light)' }">
                  <ExternalLink class="w-3 h-3" />
                  {{ composition.selectedHeaderVariant ? 'Change' : 'Select' }}
                </button>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-between px-4 py-3" :style="{ backgroundColor: 'var(--theme-bg-secondary)' }">
                <div class="flex items-center gap-3">
                  <Layers class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
                  <div>
                    <p class="text-sm font-medium" :style="{ color: 'var(--theme-text-primary)' }">Footer</p>
                    <p v-if="composition.selectedFooterVariant" class="text-xs font-mono" :style="{ color: 'var(--theme-success)' }">
                      {{ composition.selectedFooterVariant.name }}
                    </p>
                    <p v-else class="text-xs italic" :style="{ color: 'var(--theme-warning)' }">Not selected</p>
                    <p v-if="composition.selectedFooterVariant" class="text-xs mt-0.5" :style="{ color: 'var(--theme-text-muted)' }">
                      Footer nav: {{ footerNavPages.map(p => p.name).join(', ') || '—' }}
                    </p>
                  </div>
                </div>
                <button @click="router.push('/site/footer?returnTo=/site/checklist')" class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                  :style="{ color: 'var(--theme-primary)', backgroundColor: 'var(--theme-primary-light)' }">
                  <ExternalLink class="w-3 h-3" />
                  {{ composition.selectedFooterVariant ? 'Change' : 'Select' }}
                </button>
              </div>

              <!-- Default Template -->
              <div class="flex items-center justify-between px-4 py-3" :style="{ backgroundColor: 'var(--theme-bg-secondary)' }">
                <div class="flex items-center gap-3">
                  <FileCode class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
                  <div>
                    <p class="text-sm font-medium" :style="{ color: 'var(--theme-text-primary)' }">Default Page Template</p>
                    <p v-if="composition.selectedTemplate" class="text-xs font-mono" :style="{ color: 'var(--theme-success)' }">
                      {{ composition.selectedTemplate.name }}
                    </p>
                    <p v-else class="text-xs italic" :style="{ color: 'var(--theme-text-muted)' }">No default set (optional)</p>
                  </div>
                </div>
                <button @click="router.push('/site/main?returnTo=/site/checklist')" class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                  :style="{ color: 'var(--theme-primary)', backgroundColor: 'var(--theme-primary-light)' }">
                  <ExternalLink class="w-3 h-3" />
                  {{ composition.selectedTemplate ? 'Change' : 'Configure' }}
                </button>
              </div>

            </div>
            <div class="px-4 py-3 flex justify-end border-t" :style="{ borderColor: 'var(--theme-border)' }">
              <button @click="composition.toggleChecklistConfirmed('website', 'components')" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :style="websiteConfirmed.components ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-secondary)' }">
                <Check class="w-3.5 h-3.5" />
                {{ websiteConfirmed.components ? 'Confirmed' : 'Mark Confirmed' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 5 — Sanity Schema Stubs -->
        <div class="rounded-xl border overflow-hidden" :style="{ borderColor: websiteConfirmed.sanitySchema ? 'var(--theme-success)' : 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }">
          <div
            class="flex items-center justify-between px-4 py-3 cursor-pointer"
            :style="{ backgroundColor: websiteConfirmed.sanitySchema ? 'var(--theme-success-light)' : 'var(--theme-bg-card)' }"
            @click="togglePanel('sanitySchema')"
          >
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                :style="websiteConfirmed.sanitySchema ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
              ><Check class="w-3 h-3" /></div>
              <div>
                <p class="font-semibold text-sm" :style="{ color: 'var(--theme-text-primary)' }">Sanity Schema Stubs</p>
                <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Document types derived from component selections and sitemap.</p>
              </div>
            </div>
            <ChevronUp v-if="expanded.has('sanitySchema')" class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
            <ChevronDown v-else class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
          </div>
          <div v-if="expanded.has('sanitySchema')" class="border-t" :style="{ borderColor: 'var(--theme-border)' }">
            <div class="p-4" :style="{ backgroundColor: 'var(--theme-bg-secondary)' }">
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="docType in sanityDocTypes"
                  :key="docType"
                  class="text-xs font-mono px-2 py-1 rounded-full"
                  :style="{ backgroundColor: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }"
                >{{ docType }}</span>
              </div>
              <p class="text-xs mt-3" :style="{ color: 'var(--theme-text-muted)' }">
                These types update automatically as you select header, footer, and content components.
                Additional types from component <span class="font-mono">schemaRequirements</span> are merged in automatically.
              </p>
            </div>
            <div class="px-4 py-3 flex justify-end border-t" :style="{ borderColor: 'var(--theme-border)' }">
              <button @click="composition.toggleChecklistConfirmed('website', 'sanitySchema')" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :style="websiteConfirmed.sanitySchema ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-card)', color: 'var(--theme-text-secondary)' }">
                <Check class="w-3.5 h-3.5" />
                {{ websiteConfirmed.sanitySchema ? 'Confirmed' : 'Mark Confirmed' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 6 — Legal Pages Summary -->
        <div class="rounded-xl border overflow-hidden" :style="{ borderColor: websiteConfirmed.legalPages ? 'var(--theme-success)' : 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }">
          <div
            class="flex items-center justify-between px-4 py-3 cursor-pointer"
            :style="{ backgroundColor: websiteConfirmed.legalPages ? 'var(--theme-success-light)' : 'var(--theme-bg-card)' }"
            @click="togglePanel('legalPages')"
          >
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                :style="websiteConfirmed.legalPages ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
              ><Check class="w-3 h-3" /></div>
              <div>
                <p class="font-semibold text-sm" :style="{ color: 'var(--theme-text-primary)' }">Legal Pages Summary</p>
                <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Templates are loaded into the CMS for client editing.</p>
              </div>
            </div>
            <ChevronUp v-if="expanded.has('legalPages')" class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
            <ChevronDown v-else class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
          </div>
          <div v-if="expanded.has('legalPages')" class="border-t" :style="{ borderColor: 'var(--theme-border)' }">
            <div class="divide-y" :style="{ borderColor: 'var(--theme-border)' }">
              <div
                v-for="legal in legalStatus"
                :key="legal.key"
                class="flex items-center justify-between px-4 py-3"
                :style="{ backgroundColor: 'var(--theme-bg-secondary)' }"
              >
                <span class="text-sm" :style="{ color: 'var(--theme-text-primary)' }">{{ legal.label }}</span>
                <span
                  class="text-xs font-medium px-2 py-0.5 rounded-full"
                  :style="legal.done ? { backgroundColor: 'var(--theme-success-light)', color: 'var(--theme-success)' } : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
                >{{ legal.done ? 'Template ready' : 'Not set' }}</span>
              </div>
            </div>
            <div class="px-4 py-3 flex items-center justify-between border-t" :style="{ borderColor: 'var(--theme-border)' }">
              <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Client can update content directly in the CMS.</p>
              <button @click="composition.toggleChecklistConfirmed('website', 'legalPages')" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :style="websiteConfirmed.legalPages ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-card)', color: 'var(--theme-text-secondary)' }">
                <Check class="w-3.5 h-3.5" />
                {{ websiteConfirmed.legalPages ? 'Confirmed' : 'Mark Confirmed' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 7 — .env.example (editable) -->
        <div class="rounded-xl border overflow-hidden" :style="{ borderColor: websiteConfirmed.envExample ? 'var(--theme-success)' : 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }">
          <div
            class="flex items-center justify-between px-4 py-3 cursor-pointer"
            :style="{ backgroundColor: websiteConfirmed.envExample ? 'var(--theme-success-light)' : 'var(--theme-bg-card)' }"
            @click="togglePanel('envExample')"
          >
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                :style="websiteConfirmed.envExample ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
              ><Check class="w-3 h-3" /></div>
              <div>
                <p class="font-semibold text-sm" :style="{ color: 'var(--theme-text-primary)' }">.env.example</p>
                <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Fill in project IDs now so it's ready on build.</p>
              </div>
            </div>
            <ChevronUp v-if="expanded.has('envExample')" class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
            <ChevronDown v-else class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
          </div>
          <div v-if="expanded.has('envExample')" class="border-t" :style="{ borderColor: 'var(--theme-border)' }">
            <!-- Input fields -->
            <div class="p-4 space-y-3" :style="{ backgroundColor: 'var(--theme-bg-secondary)' }">
              <p class="text-xs font-semibold mb-1" :style="{ color: 'var(--theme-text-secondary)' }">Sanity CMS</p>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs font-mono mb-1 block" :style="{ color: 'var(--theme-text-muted)' }">VITE_SANITY_PROJECT_ID</label>
                  <input
                    v-model="envLocal.sanityProjectId"
                    @blur="saveEnvField"
                    placeholder="abc12345"
                    class="w-full text-xs font-mono rounded-lg px-2.5 py-2 border outline-none"
                    :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }"
                  />
                </div>
                <div>
                  <label class="text-xs font-mono mb-1 block" :style="{ color: 'var(--theme-text-muted)' }">VITE_SANITY_DATASET</label>
                  <input
                    v-model="envLocal.sanityDataset"
                    @blur="saveEnvField"
                    placeholder="production"
                    class="w-full text-xs font-mono rounded-lg px-2.5 py-2 border outline-none"
                    :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }"
                  />
                </div>
              </div>

              <p class="text-xs font-semibold mt-3 mb-1" :style="{ color: 'var(--theme-text-secondary)' }">Site</p>
              <div>
                <label class="text-xs font-mono mb-1 block" :style="{ color: 'var(--theme-text-muted)' }">VITE_SITE_URL</label>
                <input
                  v-model="envLocal.siteUrl"
                  @blur="saveEnvField"
                  :placeholder="`https://${client?.domain ?? 'example.com'}`"
                  class="w-full text-xs font-mono rounded-lg px-2.5 py-2 border outline-none"
                  :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }"
                />
              </div>

              <p class="text-xs font-semibold mt-3 mb-1" :style="{ color: 'var(--theme-text-secondary)' }">Auth0 <span class="font-normal opacity-60">(optional)</span></p>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs font-mono mb-1 block" :style="{ color: 'var(--theme-text-muted)' }">VITE_AUTH0_DOMAIN</label>
                  <input
                    v-model="envLocal.auth0Domain"
                    @blur="saveEnvField"
                    placeholder="dev-xxxx.us.auth0.com"
                    class="w-full text-xs font-mono rounded-lg px-2.5 py-2 border outline-none"
                    :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }"
                  />
                </div>
                <div>
                  <label class="text-xs font-mono mb-1 block" :style="{ color: 'var(--theme-text-muted)' }">VITE_AUTH0_CLIENT_ID</label>
                  <input
                    v-model="envLocal.auth0ClientId"
                    @blur="saveEnvField"
                    placeholder="xxxxxxxxxxxxxxxx"
                    class="w-full text-xs font-mono rounded-lg px-2.5 py-2 border outline-none"
                    :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }"
                  />
                </div>
              </div>
            </div>
            <!-- .env preview -->
            <div class="border-t relative" :style="{ borderColor: 'var(--theme-border)' }">
              <div class="flex items-center justify-between px-4 pt-3 pb-1">
                <p class="text-xs font-semibold" :style="{ color: 'var(--theme-text-muted)' }">.env preview</p>
                <p class="text-xs" :style="{ color: 'var(--theme-danger)' }">⚠ Never commit to git</p>
              </div>
              <pre class="px-4 pb-4 text-xs font-mono overflow-x-auto" :style="{ backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-primary)' }">{{ websiteEnvOutput }}</pre>
            </div>
            <!-- Actions -->
            <div class="px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-t" :style="{ borderColor: 'var(--theme-border)' }">
              <!-- Download buttons -->
              <div class="flex items-center gap-2">
                <button
                  @click="downloadFile(websiteEnvOutput, '.env')"
                  class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                  :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
                  title="Download .env with real values"
                >
                  <Download class="w-3.5 h-3.5" />
                  Download .env
                </button>
                <button
                  @click="downloadFile(websiteEnvExampleOutput, '.env.example')"
                  class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                  :style="{ backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-secondary)', border: '1px solid var(--theme-border)' }"
                  title="Download .env.example template (safe to commit)"
                >
                  <Download class="w-3.5 h-3.5" />
                  Download .env.example
                </button>
                <button
                  @click="copyText(websiteEnvOutput)"
                  class="flex items-center gap-1.5 p-2 rounded-lg transition-colors"
                  :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
                  title="Copy .env to clipboard"
                >
                  <Copy class="w-3.5 h-3.5" />
                </button>
              </div>
              <!-- Confirm -->
              <button @click="composition.toggleChecklistConfirmed('website', 'envExample')" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :style="websiteConfirmed.envExample ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-card)', color: 'var(--theme-text-secondary)' }">
                <Check class="w-3.5 h-3.5" />
                {{ websiteConfirmed.envExample ? 'Confirmed' : 'Mark Confirmed' }}
              </button>
            </div>
          </div>
        </div>

      </div>
    </template>

    <!-- ════════════════════════════════════════════════════════ APP MODE ══════ -->
    <template v-else>
      <div class="space-y-3 mb-8">

        <!-- 1 — Vue Router Config -->
        <div class="rounded-xl border overflow-hidden" :style="{ borderColor: appConfirmed.routerConfig ? 'var(--theme-success)' : 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }">
          <div
            class="flex items-center justify-between px-4 py-3 cursor-pointer"
            :style="{ backgroundColor: appConfirmed.routerConfig ? 'var(--theme-success-light)' : 'var(--theme-bg-card)' }"
            @click="togglePanel('routerConfig')"
          >
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                :style="appConfirmed.routerConfig ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
              ><Check class="w-3 h-3" /></div>
              <div>
                <p class="font-semibold text-sm" :style="{ color: 'var(--theme-text-primary)' }">Vue Router Config</p>
                <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Generated from Build Now screens. Deferred screens excluded.</p>
              </div>
            </div>
            <ChevronUp v-if="expanded.has('routerConfig')" class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
            <ChevronDown v-else class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
          </div>
          <div v-if="expanded.has('routerConfig')" class="border-t" :style="{ borderColor: 'var(--theme-border)' }">
            <div class="relative">
              <pre class="p-4 text-xs font-mono overflow-x-auto" :style="{ backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-primary)' }">{{ routerConfigOutput }}</pre>
              <button @click="copyText(routerConfigOutput)" class="absolute top-2 right-2 p-1.5 rounded-lg" :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }" title="Copy"><Copy class="w-3.5 h-3.5" /></button>
            </div>
            <div class="px-4 py-3 flex items-center justify-between border-t" :style="{ borderColor: 'var(--theme-border)' }">
              <button @click="router.push('/site/app-screens')" class="flex items-center gap-1.5 text-xs" :style="{ color: 'var(--theme-warning)' }">
                <ExternalLink class="w-3.5 h-3.5" />Edit App Screens
              </button>
              <button @click="composition.toggleChecklistConfirmed('app', 'routerConfig')" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :style="appConfirmed.routerConfig ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-secondary)' }">
                <Check class="w-3.5 h-3.5" />
                {{ appConfirmed.routerConfig ? 'Confirmed' : 'Mark Confirmed' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 2 — Pinia Store Outline -->
        <div class="rounded-xl border overflow-hidden" :style="{ borderColor: appConfirmed.piniaStore ? 'var(--theme-success)' : 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }">
          <div
            class="flex items-center justify-between px-4 py-3 cursor-pointer"
            :style="{ backgroundColor: appConfirmed.piniaStore ? 'var(--theme-success-light)' : 'var(--theme-bg-card)' }"
            @click="togglePanel('piniaStore')"
          >
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                :style="appConfirmed.piniaStore ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
              ><Check class="w-3 h-3" /></div>
              <div>
                <p class="font-semibold text-sm" :style="{ color: 'var(--theme-text-primary)' }">Pinia Store Outline</p>
                <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">One store stub per data entity with field comments.</p>
              </div>
            </div>
            <ChevronUp v-if="expanded.has('piniaStore')" class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
            <ChevronDown v-else class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
          </div>
          <div v-if="expanded.has('piniaStore')" class="border-t" :style="{ borderColor: 'var(--theme-border)' }">
            <div class="relative">
              <pre class="p-4 text-xs font-mono overflow-x-auto" :style="{ backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-primary)' }">{{ piniaStoreOutput }}</pre>
              <button @click="copyText(piniaStoreOutput)" class="absolute top-2 right-2 p-1.5 rounded-lg" :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }" title="Copy"><Copy class="w-3.5 h-3.5" /></button>
            </div>
            <div class="px-4 py-3 flex items-center justify-between border-t" :style="{ borderColor: 'var(--theme-border)' }">
              <button @click="router.push('/site/data-model')" class="flex items-center gap-1.5 text-xs" :style="{ color: 'var(--theme-warning)' }">
                <ExternalLink class="w-3.5 h-3.5" />Edit Data Model
              </button>
              <button @click="composition.toggleChecklistConfirmed('app', 'piniaStore')" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :style="appConfirmed.piniaStore ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-secondary)' }">
                <Check class="w-3.5 h-3.5" />
                {{ appConfirmed.piniaStore ? 'Confirmed' : 'Mark Confirmed' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 3 — Sanity Schema Stubs (app) -->
        <div class="rounded-xl border overflow-hidden" :style="{ borderColor: appConfirmed.sanitySchema ? 'var(--theme-success)' : 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }">
          <div
            class="flex items-center justify-between px-4 py-3 cursor-pointer"
            :style="{ backgroundColor: appConfirmed.sanitySchema ? 'var(--theme-success-light)' : 'var(--theme-bg-card)' }"
            @click="togglePanel('sanitySchema')"
          >
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                :style="appConfirmed.sanitySchema ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
              ><Check class="w-3 h-3" /></div>
              <div>
                <p class="font-semibold text-sm" :style="{ color: 'var(--theme-text-primary)' }">Sanity Schema Stubs</p>
                <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Document types derived from your data model entities.</p>
              </div>
            </div>
            <ChevronUp v-if="expanded.has('sanitySchema')" class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
            <ChevronDown v-else class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
          </div>
          <div v-if="expanded.has('sanitySchema')" class="border-t" :style="{ borderColor: 'var(--theme-border)' }">
            <div class="p-4" :style="{ backgroundColor: 'var(--theme-bg-secondary)' }">
              <div v-if="appSanityDocTypes.length > 0" class="flex flex-wrap gap-2">
                <span v-for="docType in appSanityDocTypes" :key="docType" class="text-xs font-mono px-2 py-1 rounded-full"
                  :style="{ backgroundColor: 'var(--theme-warning-light)', color: 'var(--theme-warning)' }">{{ docType }}</span>
              </div>
              <p v-else class="text-sm italic" :style="{ color: 'var(--theme-text-muted)' }">No entities defined yet. Add entities in the Data Model step.</p>
              <p class="text-xs mt-3" :style="{ color: 'var(--theme-text-muted)' }">Each entity maps to a Sanity document type. Define field schemas in the studio.</p>
            </div>
            <div class="px-4 py-3 flex justify-end border-t" :style="{ borderColor: 'var(--theme-border)' }">
              <button @click="composition.toggleChecklistConfirmed('app', 'sanitySchema')" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :style="appConfirmed.sanitySchema ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-card)', color: 'var(--theme-text-secondary)' }">
                <Check class="w-3.5 h-3.5" />
                {{ appConfirmed.sanitySchema ? 'Confirmed' : 'Mark Confirmed' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 4 — Component Manifest -->
        <div class="rounded-xl border overflow-hidden" :style="{ borderColor: appConfirmed.componentManifest ? 'var(--theme-success)' : 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }">
          <div
            class="flex items-center justify-between px-4 py-3 cursor-pointer"
            :style="{ backgroundColor: appConfirmed.componentManifest ? 'var(--theme-success-light)' : 'var(--theme-bg-card)' }"
            @click="togglePanel('componentManifest')"
          >
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                :style="appConfirmed.componentManifest ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
              ><Check class="w-3 h-3" /></div>
              <div>
                <p class="font-semibold text-sm" :style="{ color: 'var(--theme-text-primary)' }">Component Manifest</p>
                <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">All screens with route, view type, and build status.</p>
              </div>
            </div>
            <ChevronUp v-if="expanded.has('componentManifest')" class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
            <ChevronDown v-else class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
          </div>
          <div v-if="expanded.has('componentManifest')" class="border-t" :style="{ borderColor: 'var(--theme-border)' }">
            <div class="relative">
              <pre class="p-4 text-xs font-mono overflow-x-auto" :style="{ backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-primary)' }">{{ componentManifestOutput }}</pre>
              <button @click="copyText(componentManifestOutput)" class="absolute top-2 right-2 p-1.5 rounded-lg" :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }" title="Copy"><Copy class="w-3.5 h-3.5" /></button>
            </div>
            <div class="px-4 py-3 flex justify-end border-t" :style="{ borderColor: 'var(--theme-border)' }">
              <button @click="composition.toggleChecklistConfirmed('app', 'componentManifest')" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :style="appConfirmed.componentManifest ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-card)', color: 'var(--theme-text-secondary)' }">
                <Check class="w-3.5 h-3.5" />
                {{ appConfirmed.componentManifest ? 'Confirmed' : 'Mark Confirmed' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 5 — .env.example (app) -->
        <div class="rounded-xl border overflow-hidden" :style="{ borderColor: appConfirmed.envExample ? 'var(--theme-success)' : 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }">
          <div
            class="flex items-center justify-between px-4 py-3 cursor-pointer"
            :style="{ backgroundColor: appConfirmed.envExample ? 'var(--theme-success-light)' : 'var(--theme-bg-card)' }"
            @click="togglePanel('envExample')"
          >
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                :style="appConfirmed.envExample ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
              ><Check class="w-3 h-3" /></div>
              <div>
                <p class="font-semibold text-sm" :style="{ color: 'var(--theme-text-primary)' }">.env.example Preview</p>
                <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Environment variable scaffold for this app project.</p>
              </div>
            </div>
            <ChevronUp v-if="expanded.has('envExample')" class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
            <ChevronDown v-else class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
          </div>
          <div v-if="expanded.has('envExample')" class="border-t" :style="{ borderColor: 'var(--theme-border)' }">
            <div class="relative">
              <pre class="p-4 text-xs font-mono overflow-x-auto" :style="{ backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-primary)' }">{{ appEnvExample }}</pre>
              <button @click="copyText(appEnvExample)" class="absolute top-2 right-2 p-1.5 rounded-lg" :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }" title="Copy"><Copy class="w-3.5 h-3.5" /></button>
            </div>
            <div class="px-4 py-3 flex justify-end border-t" :style="{ borderColor: 'var(--theme-border)' }">
              <button @click="composition.toggleChecklistConfirmed('app', 'envExample')" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :style="appConfirmed.envExample ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' } : { backgroundColor: 'var(--theme-bg-card)', color: 'var(--theme-text-secondary)' }">
                <Check class="w-3.5 h-3.5" />
                {{ appConfirmed.envExample ? 'Confirmed' : 'Mark Confirmed' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Go Public — toggle -->
        <div
          class="rounded-xl border-2 overflow-hidden"
          :style="{ borderColor: sb.isPublic ? 'var(--theme-primary)' : 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }"
        >
          <div class="px-4 py-4">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  :style="{ backgroundColor: sb.isPublic ? 'var(--theme-primary-light)' : 'var(--theme-bg-tertiary)', color: sb.isPublic ? 'var(--theme-primary)' : 'var(--theme-text-muted)' }">
                  <Globe class="w-5 h-5" />
                </div>
                <div>
                  <p class="font-semibold text-sm" :style="{ color: 'var(--theme-text-primary)' }">Go Public</p>
                  <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Enable when you plan to launch this app publicly. Unlocks legal and SEO additions.</p>
                </div>
              </div>
              <button @click="toggleIsPublic" class="relative w-11 h-6 rounded-full transition-colors shrink-0"
                :style="{ backgroundColor: sb.isPublic ? 'var(--theme-primary)' : 'var(--theme-bg-tertiary)' }"
                :aria-label="sb.isPublic ? 'Disable Go Public' : 'Enable Go Public'">
                <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                  :class="sb.isPublic ? 'translate-x-5' : 'translate-x-0'" />
              </button>
            </div>
            <div v-if="sb.isPublic" class="mt-3 p-3 rounded-lg" :style="{ backgroundColor: 'var(--theme-primary-light)' }">
              <p class="text-xs font-semibold mb-1.5" :style="{ color: 'var(--theme-primary)' }">Unlocked for future build iteration:</p>
              <ul class="space-y-1">
                <li class="text-xs" :style="{ color: 'var(--theme-text-secondary)' }">• Legal Pages (Privacy Policy, Terms, Accessibility, Cookie)</li>
                <li class="text-xs" :style="{ color: 'var(--theme-text-secondary)' }">• SEO meta tags per screen</li>
                <li class="text-xs" :style="{ color: 'var(--theme-text-secondary)' }">• Open Graph / social share tags</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </template>

    <!-- Progress summary -->
    <div class="p-4 rounded-xl border mb-6" :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium" :style="{ color: 'var(--theme-text-secondary)' }">Review Progress</span>
        <span class="text-sm font-bold" :style="{ color: allConfirmed ? 'var(--theme-success)' : (isAppMode ? 'var(--theme-warning)' : 'var(--theme-primary)') }">
          {{ confirmedCount }}/{{ totalPanels }} confirmed
        </span>
      </div>
      <div class="h-2 rounded-full overflow-hidden" :style="{ backgroundColor: 'var(--theme-bg-tertiary)' }">
        <div class="h-full rounded-full transition-all duration-500"
          :style="{
            width: `${(confirmedCount / totalPanels) * 100}%`,
            backgroundColor: allConfirmed ? 'var(--theme-success)' : (isAppMode ? 'var(--theme-warning)' : 'var(--theme-primary)')
          }"
        />
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-between">
      <button
        @click="router.push(isAppMode ? '/site/data-model' : '/site/legal')"
        class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors"
        :style="{ color: 'var(--theme-text-secondary)', backgroundColor: 'var(--theme-bg-secondary)' }"
      >
        <ArrowLeft class="w-4 h-4" />
        Back
      </button>
      <button
        :disabled="!allConfirmed"
        @click="complete"
        class="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        :style="{ backgroundColor: isAppMode ? 'var(--theme-warning)' : 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
      >
        Complete {{ isAppMode ? 'App' : 'Site' }} Setup
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
