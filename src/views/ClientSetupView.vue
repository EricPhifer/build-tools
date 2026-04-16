<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, ArrowRight, Palette, Type, Globe, Loader2, X, Upload, Link, ExternalLink, Server, Shield, HardDrive, Mail, Database, Zap, BarChart2, Box, ActivitySquare, RefreshCw, FileUp } from 'lucide-vue-next'
import { useWorkflowStore } from '../stores/workflow'
import { useCompositionStore } from '../stores/composition'
import { useClientApi } from '../composables/useClientApi'
import WorkflowProgress from '../components/WorkflowProgress.vue'
import { SOCIAL_PLATFORM_LABELS } from '../types/registry'
import type { ClientInfo, BrandKit, ConnectedWebsite, ManagedService, ClientHealthCheck } from '../types/registry'

const router = useRouter()
const workflow = useWorkflowStore()
const composition = useCompositionStore()
const clientApi = useClientApi()

// ─── Client Search ────────────────────────────────────────────────────────────
const searchQuery = ref('')
const showSearch = ref(!workflow.clientInfo)
const searchResults = ref<ClientInfo[]>([])

let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, (query) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (!showSearch.value) return
  searchTimeout = setTimeout(async () => {
    searchResults.value = await clientApi.searchClients(query)
  }, 300)
})

watch(showSearch, async (visible) => {
  if (visible) {
    searchResults.value = await clientApi.searchClients(searchQuery.value)
  }
})

// ─── Form State ───────────────────────────────────────────────────────────────
const clientName = ref(workflow.clientInfo?.name ?? '')
const contactEmail = ref(workflow.clientInfo?.contactEmail ?? '')
const industry = ref(workflow.clientInfo?.brandKit.industry ?? '')

// Domain is stored as "slug.tld" (e.g. "acme.co.uk"); split for editing
function splitDomain(full: string): [string, string] {
  const dot = full.indexOf('.')
  return dot > -1 ? [full.slice(0, dot), full.slice(dot + 1)] : [full, 'com']
}
const [_initSlug, _initTld] = splitDomain(workflow.clientInfo?.domain ?? '')
const domain = ref(_initSlug)   // slug only, e.g. "acme"
const tld = ref(_initTld)       // everything after first dot, e.g. "com" or "co.uk"
const whatTheyOffer = ref(workflow.clientInfo?.brandKit.whatTheyOffer ?? '')
const idealCustomer = ref(workflow.clientInfo?.idealCustomer ?? '')

// Business Contact (NAP — Name, Address, Phone) — core local SEO data for footers + JSON-LD
const _bc = workflow.clientInfo?.businessContact
const bcStreetAddress = ref(_bc?.streetAddress ?? '')
const bcCity          = ref(_bc?.city          ?? '')
const bcRegion        = ref(_bc?.region        ?? '')
const bcPostalCode    = ref(_bc?.postalCode    ?? '')
const bcCountry       = ref(_bc?.country       ?? '')
const bcPhone         = ref(_bc?.phone         ?? '')

// Brand colors
const _c = workflow.clientInfo?.brandKit.colors

// Light theme (12 tokens)
const colorPrimary        = ref(_c?.primary        ?? '#2D6A4F')
const colorPrimaryHover   = ref(_c?.primaryHover   ?? '')
const colorPrimaryLight   = ref(_c?.primaryLight   ?? '')
const colorSecondary      = ref(_c?.secondary      ?? '#40916C')
const colorSecondaryHover = ref(_c?.secondaryHover ?? '')
const colorAccent         = ref(_c?.accent         ?? '#95D5B2')
const colorAccentHover    = ref(_c?.accentHover    ?? '')
const colorBackground     = ref(_c?.background ?? _c?.neutral ?? '#FFFFFF')
const colorSurface        = ref(_c?.surface        ?? '')
const colorText           = ref(_c?.text           ?? '')
const colorTextSecondary  = ref(_c?.textSecondary  ?? '')
const colorBorder         = ref(_c?.border         ?? '')

// Dark theme (8 tokens)
const colorPrimaryDark       = ref(_c?.primaryDark       ?? '')
const colorSecondaryDark     = ref(_c?.secondaryDark     ?? '')
const colorAccentDark        = ref(_c?.accentDark        ?? '')
const colorBackgroundDark    = ref(_c?.backgroundDark    ?? '')
const colorSurfaceDark       = ref(_c?.surfaceDark       ?? '')
const colorTextDark          = ref(_c?.textDark          ?? '')
const colorTextSecondaryDark = ref(_c?.textSecondaryDark ?? '')
const colorBorderDark        = ref(_c?.borderDark        ?? '')

// Brand fonts
const hFont = workflow.clientInfo?.brandKit.fonts.find(f => f.category === 'heading')
const bFont = workflow.clientInfo?.brandKit.fonts.find(f => f.category === 'body')
const headingFont = ref(hFont?.name ?? 'Playfair Display')
const headingFontWeights = ref<number[]>(hFont?.weights ?? (hFont?.weight ? [parseInt(hFont.weight)] : [700, 800]))
const headingFontStyle = ref<'normal' | 'italic'>(hFont?.style ?? 'normal')
const bodyFont = ref(bFont?.name ?? 'Inter')
const bodyFontWeights = ref<number[]>(bFont?.weights ?? (bFont?.weight ? [parseInt(bFont.weight)] : [400]))
const bodyFontStyle = ref<'normal' | 'italic'>(bFont?.style ?? 'normal')

// Logo
const logoMode = ref<'file' | 'url'>(
  workflow.clientInfo?.brandKit.logoUrl?.startsWith('data:') ? 'file' : 'url'
)
const logoUrl = ref(workflow.clientInfo?.brandKit.logoUrl ?? '')
const logoFileDataUrl = ref(
  workflow.clientInfo?.brandKit.logoUrl?.startsWith('data:')
    ? workflow.clientInfo.brandKit.logoUrl
    : ''
)
const logoUrlDark = ref(workflow.clientInfo?.brandKit.logos?.dark ?? '')
const logoFavicon = ref(workflow.clientInfo?.brandKit.logos?.favicon ?? '')

// Border radius
const borderRadiusValue = ref(workflow.clientInfo?.brandKit.borderRadius ?? '')

// ─── Read-only imported data ───────────────────────────────────────────────────
const connectedWebsites = ref<ConnectedWebsite[]>(workflow.clientInfo?.connectedWebsites ?? [])
const managedServices = ref<ManagedService[]>(workflow.clientInfo?.managedServices ?? [])
const healthCheck = ref<ClientHealthCheck | null>(workflow.clientInfo?.healthCheck ?? null)

const socialLinks = computed(() => connectedWebsites.value.filter(s => SOCIAL_PLATFORM_LABELS.has(s.label)))

// ─── Domain Handling ──────────────────────────────────────────────────────────
const domainEdited = ref(!!workflow.clientInfo?.domain)
watch(clientName, (name) => {
  if (!domainEdited.value) {
    domain.value = name.toLowerCase().replace(/[^a-z0-9]+/g, '')
  }
})

const handleDomainInput = (val: string) => {
  domainEdited.value = true
  domain.value = val.replace(/[^a-z0-9-]/g, '')  // slugs: alphanumeric + hyphens only
}

const handleTldInput = (val: string) => {
  tld.value = val.replace(/[^a-z0-9.]/g, '')     // TLDs: letters, digits, dots only
}

// ─── Logo Handling ────────────────────────────────────────────────────────────
const handleLogoFile = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    logoFileDataUrl.value = e.target?.result as string
    logoUrl.value = logoFileDataUrl.value
  }
  reader.readAsDataURL(file)
}

const clearLogo = () => {
  logoUrl.value = ''
  logoFileDataUrl.value = ''
  const input = document.getElementById('logo-file-input') as HTMLInputElement | null
  if (input) input.value = ''
}

const currentLogoSrc = computed(() => {
  if (logoMode.value === 'file') return logoFileDataUrl.value
  return logoUrl.value
})

// ─── Google Fonts Loader ──────────────────────────────────────────────────────
function loadGoogleFont(fontName: string) {
  if (!fontName.trim()) return
  const id = `gfont-${fontName.replace(/\s+/g, '-').toLowerCase()}`
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,700&display=swap`
  document.head.appendChild(link)
}

watch(headingFont, (font) => loadGoogleFont(font), { immediate: true })
watch(bodyFont, (font) => loadGoogleFont(font), { immediate: true })

// ─── Client Load ──────────────────────────────────────────────────────────────
function loadClient(client: ClientInfo) {
  clientName.value = client.name
  contactEmail.value = client.contactEmail
  const [slug, clientTld] = splitDomain(client.domain)
  domain.value = slug
  tld.value = clientTld
  domainEdited.value = true
  industry.value = client.brandKit.industry
  whatTheyOffer.value = client.brandKit.whatTheyOffer
  idealCustomer.value = client.idealCustomer

  const c = client.brandKit.colors
  const l = c.light  // full 28-key light palette (populated by API but not flat fields)
  const d = c.dark   // full 28-key dark palette
  colorPrimary.value        = c.primary
  colorPrimaryHover.value   = c.primaryHover   ?? l?.primaryHover   ?? ''
  colorPrimaryLight.value   = c.primaryLight   ?? l?.primaryLight   ?? ''
  colorSecondary.value      = c.secondary
  colorSecondaryHover.value = c.secondaryHover ?? l?.secondaryHover ?? ''
  colorAccent.value         = c.accent
  colorAccentHover.value    = c.accentHover    ?? l?.accentHover    ?? ''
  colorBackground.value     = c.background     ?? l?.bgPrimary      ?? c.neutral ?? '#FFFFFF'
  colorSurface.value        = c.surface        ?? l?.bgSecondary    ?? ''
  colorText.value           = c.text           ?? l?.textPrimary    ?? ''
  colorTextSecondary.value  = c.textSecondary  ?? l?.textSecondary  ?? ''
  colorBorder.value         = c.border         ?? l?.border         ?? ''
  colorPrimaryDark.value       = c.primaryDark       ?? d?.primary       ?? ''
  colorSecondaryDark.value     = c.secondaryDark     ?? d?.secondary     ?? ''
  colorAccentDark.value        = c.accentDark        ?? d?.accent        ?? ''
  colorBackgroundDark.value    = c.backgroundDark    ?? d?.bgPrimary     ?? ''
  colorSurfaceDark.value       = c.surfaceDark       ?? d?.bgSecondary   ?? ''
  colorTextDark.value          = c.textDark          ?? d?.textPrimary   ?? ''
  colorTextSecondaryDark.value = c.textSecondaryDark ?? d?.textSecondary ?? ''
  colorBorderDark.value        = c.borderDark        ?? d?.border        ?? ''

  const hF = client.brandKit.fonts.find(f => f.category === 'heading')
  const bF = client.brandKit.fonts.find(f => f.category === 'body')
  headingFont.value = hF?.name ?? 'Playfair Display'
  headingFontWeights.value = hF?.weights ?? (hF?.weight ? [parseInt(hF.weight)] : [700, 800])
  headingFontStyle.value = hF?.style ?? 'normal'
  bodyFont.value = bF?.name ?? 'Inter'
  bodyFontWeights.value = bF?.weights ?? (bF?.weight ? [parseInt(bF.weight)] : [400])
  bodyFontStyle.value = bF?.style ?? 'normal'

  const primaryLogoSrc = client.brandKit.logos?.primary ?? client.brandKit.logoUrl ?? ''
  if (primaryLogoSrc) {
    logoMode.value = primaryLogoSrc.startsWith('data:') ? 'file' : 'url'
    logoUrl.value = primaryLogoSrc.startsWith('data:') ? '' : primaryLogoSrc
    logoFileDataUrl.value = primaryLogoSrc.startsWith('data:') ? primaryLogoSrc : ''
  } else {
    logoUrl.value = ''
    logoFileDataUrl.value = ''
  }
  logoUrlDark.value = client.brandKit.logos?.dark ?? ''
  logoFavicon.value = client.brandKit.logos?.favicon ?? ''
  borderRadiusValue.value = client.brandKit.borderRadius ?? ''

  const bc = client.businessContact
  bcStreetAddress.value = bc?.streetAddress ?? ''
  bcCity.value          = bc?.city          ?? ''
  bcRegion.value        = bc?.region        ?? ''
  bcPostalCode.value    = bc?.postalCode    ?? ''
  bcCountry.value       = bc?.country       ?? ''
  bcPhone.value         = bc?.phone         ?? ''

  connectedWebsites.value = client.connectedWebsites ?? []
  managedServices.value = client.managedServices ?? []
  healthCheck.value = client.healthCheck ?? null

  workflow.setClient(client)
  workflow.saveClient(client)
  showSearch.value = false
  searchQuery.value = ''
}

// ─── Import from Build Config JSON ────────────────────────────────────────────
const fileInput = ref<HTMLInputElement | null>(null)
const importError = ref('')

function triggerImport() {
  fileInput.value?.click()
}

async function importFromJson(event: Event) {
  importError.value = ''
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config: any = JSON.parse(text)

    // Validate minimum expected structure
    if (!config.client?.name && !config.project?.name) {
      importError.value = 'Invalid config file — missing client or project name.'
      return
    }

    // 1. Restore client info to form refs and workflow store
    if (config.client) {
      loadClient(config.client)
    }

    // 2. Restore composition, sitemap, dashboard, env, legal via existing function
    composition.loadFromBuildConfig(config)

    // 3. Restore enabledLegalPages from legal.enabledPages if present
    if (config.legal?.enabledPages) {
      composition.setEnabledLegalPages(config.legal.enabledPages)
    }

    showSearch.value = false
  } catch {
    importError.value = 'Failed to parse JSON file. Ensure it matches the exported build config format.'
  } finally {
    // Reset file input so the same file can be re-imported
    if (fileInput.value) fileInput.value.value = ''
  }
}

// ─── Build & Continue ─────────────────────────────────────────────────────────
const canContinue = computed(() => clientName.value.trim().length > 0 && colorPrimary.value.length > 0)

function buildClientInfo(): ClientInfo {
  const now = new Date().toISOString()
  const brandKit: BrandKit = {
    colors: {
      // Required (backward compat)
      primary:   colorPrimary.value,
      secondary: colorSecondary.value,
      accent:    colorAccent.value,
      neutral:   colorBackground.value,
      // Extended light tokens
      primaryHover:   colorPrimaryHover.value   || undefined,
      primaryLight:   colorPrimaryLight.value   || undefined,
      secondaryHover: colorSecondaryHover.value || undefined,
      accentHover:    colorAccentHover.value    || undefined,
      background:     colorBackground.value     || undefined,
      surface:        colorSurface.value        || undefined,
      text:           colorText.value           || undefined,
      textSecondary:  colorTextSecondary.value  || undefined,
      border:         colorBorder.value         || undefined,
      // Dark tokens
      primaryDark:        colorPrimaryDark.value        || undefined,
      secondaryDark:      colorSecondaryDark.value      || undefined,
      accentDark:         colorAccentDark.value         || undefined,
      neutralDark:        colorBackgroundDark.value     || undefined,
      backgroundDark:     colorBackgroundDark.value     || undefined,
      surfaceDark:        colorSurfaceDark.value        || undefined,
      textDark:           colorTextDark.value           || undefined,
      textSecondaryDark:  colorTextSecondaryDark.value  || undefined,
      borderDark:         colorBorderDark.value         || undefined,
      // preserve full 28-key theme sets loaded from API
      light: workflow.clientInfo?.brandKit.colors.light,
      dark:  workflow.clientInfo?.brandKit.colors.dark
    },
    fonts: [
      {
        name: headingFont.value, category: 'heading',
        importUrl: workflow.clientInfo?.brandKit.fonts.find(f => f.category === 'heading')?.importUrl,
        weights: headingFontWeights.value, weight: headingFontWeights.value[0]?.toString(), style: headingFontStyle.value
      },
      {
        name: bodyFont.value, category: 'body',
        importUrl: workflow.clientInfo?.brandKit.fonts.find(f => f.category === 'body')?.importUrl,
        weights: bodyFontWeights.value, weight: bodyFontWeights.value[0]?.toString(), style: bodyFontStyle.value
      }
    ],
    logoUrl: currentLogoSrc.value || null,
    logos: {
      primary: currentLogoSrc.value || undefined,
      dark: logoUrlDark.value || undefined,
      favicon: logoFavicon.value || undefined
    },
    borderRadius: borderRadiusValue.value || undefined,
    guidelines: workflow.clientInfo?.brandKit.guidelines,
    whatTheyOffer: whatTheyOffer.value,
    industry: industry.value
  }

  const hasBusinessContact =
    bcStreetAddress.value || bcCity.value || bcRegion.value ||
    bcPostalCode.value || bcCountry.value || bcPhone.value

  return {
    id: workflow.clientInfo?.id ?? crypto.randomUUID(),
    name: clientName.value,
    contactEmail: contactEmail.value,
    domain: tld.value ? `${domain.value}.${tld.value}` : domain.value,
    brandKit,
    idealCustomer: idealCustomer.value,
    createdAt: workflow.clientInfo?.createdAt ?? now,
    updatedAt: now,
    businessContact: hasBusinessContact ? {
      businessName:  clientName.value || undefined,
      streetAddress: bcStreetAddress.value || undefined,
      city:          bcCity.value          || undefined,
      region:        bcRegion.value        || undefined,
      postalCode:    bcPostalCode.value    || undefined,
      country:       bcCountry.value       || undefined,
      phone:         bcPhone.value         || undefined,
      email:         contactEmail.value    || undefined
    } : undefined,
    connectedWebsites: connectedWebsites.value.length > 0 ? connectedWebsites.value : undefined,
    managedServices: managedServices.value.length > 0 ? managedServices.value : undefined,
    healthCheck: healthCheck.value ?? undefined
  }
}

function handleContinue() {
  const client = buildClientInfo()
  workflow.setClient(client)
  workflow.saveClient(client)
  workflow.completeStep('client')
  workflow.goToStep('site')
  router.push('/site')
}

// ─── Resync from Dashboard ─────────────────────────────────────────────────────
const resyncing = ref(false)

async function resyncClient() {
  const id = workflow.clientInfo?.id
  if (!id) return
  resyncing.value = true
  const kit = await clientApi.getBrandKit(id)
  resyncing.value = false
  if (!kit) return

  // Apply colors from API's full light/dark objects
  const c = kit.colors
  colorPrimary.value        = c.primary
  colorPrimaryHover.value   = c.primaryHover   ?? ''
  colorPrimaryLight.value   = c.primaryLight   ?? ''
  colorSecondary.value      = c.secondary
  colorSecondaryHover.value = c.secondaryHover ?? ''
  colorAccent.value         = c.accent
  colorAccentHover.value    = c.accentHover    ?? ''
  colorBackground.value     = c.background ?? c.neutral ?? '#FFFFFF'
  colorSurface.value        = c.surface        ?? ''
  colorText.value           = c.text           ?? ''
  colorTextSecondary.value  = c.textSecondary  ?? ''
  colorBorder.value         = c.border         ?? ''
  colorPrimaryDark.value       = c.primaryDark       ?? ''
  colorSecondaryDark.value     = c.secondaryDark     ?? ''
  colorAccentDark.value        = c.accentDark        ?? ''
  colorBackgroundDark.value    = c.backgroundDark    ?? ''
  colorSurfaceDark.value       = c.surfaceDark       ?? ''
  colorTextDark.value          = c.textDark          ?? ''
  colorTextSecondaryDark.value = c.textSecondaryDark ?? ''
  colorBorderDark.value        = c.borderDark        ?? ''

  // Apply fonts
  const hF = kit.fonts.find(f => f.category === 'heading')
  const bF = kit.fonts.find(f => f.category === 'body')
  if (hF?.name) { headingFont.value = hF.name; headingFontWeights.value = hF.weights ?? [700, 800] }
  if (bF?.name) { bodyFont.value = bF.name; bodyFontWeights.value = bF.weights ?? [400] }

  // Apply logos + radius
  logoUrl.value = kit.logos?.primary ?? kit.logoUrl ?? ''
  logoUrlDark.value = kit.logos?.dark ?? ''
  logoFavicon.value = kit.logos?.favicon ?? ''
  borderRadiusValue.value = kit.borderRadius ?? ''

  // Persist: save current form state merged with the fresh full color objects
  const updated = buildClientInfo()
  updated.brandKit.colors.light = kit.colors.light
  updated.brandKit.colors.dark = kit.colors.dark
  updated.brandKit.logos = kit.logos
  updated.brandKit.guidelines = kit.guidelines
  workflow.setClient(updated)
  workflow.saveClient(updated)
}

// Popular font quick-picks
const headingFontPicks = ['Playfair Display', 'Merriweather', 'Montserrat', 'Lora', 'Raleway', 'Oswald', 'Plus Jakarta Sans', 'Space Grotesk']
const bodyFontPicks = ['Inter', 'Poppins', 'Open Sans', 'Lato', 'Roboto', 'Nunito', 'DM Sans']

const fontWeights = [300, 400, 500, 600, 700, 800, 900]

const headingPreviewWeight = computed(() =>
  headingFontWeights.value.length > 0 ? Math.max(...headingFontWeights.value).toString() : '700'
)

function toggleHeadingWeight(w: number) {
  if (headingFontWeights.value.includes(w)) {
    if (headingFontWeights.value.length > 1) {
      headingFontWeights.value = headingFontWeights.value.filter(x => x !== w)
    }
  } else {
    headingFontWeights.value = [...headingFontWeights.value, w].sort((a, b) => a - b)
  }
}

function toggleBodyWeight(w: number) {
  if (bodyFontWeights.value.includes(w)) {
    if (bodyFontWeights.value.length > 1) {
      bodyFontWeights.value = bodyFontWeights.value.filter(x => x !== w)
    }
  } else {
    bodyFontWeights.value = [...bodyFontWeights.value, w].sort((a, b) => a - b)
  }
}

// ─── Color definition arrays for template ─────────────────────────────────────
const lightColorDefs = [
  { label: 'Primary',        get: () => colorPrimary.value,        set: (v: string) => { colorPrimary.value = v } },
  { label: 'Primary Hover',  get: () => colorPrimaryHover.value,   set: (v: string) => { colorPrimaryHover.value = v } },
  { label: 'Primary Light',  get: () => colorPrimaryLight.value,   set: (v: string) => { colorPrimaryLight.value = v } },
  { label: 'Secondary',      get: () => colorSecondary.value,      set: (v: string) => { colorSecondary.value = v } },
  { label: 'Sec. Hover',     get: () => colorSecondaryHover.value, set: (v: string) => { colorSecondaryHover.value = v } },
  { label: 'Accent',         get: () => colorAccent.value,         set: (v: string) => { colorAccent.value = v } },
  { label: 'Accent Hover',   get: () => colorAccentHover.value,    set: (v: string) => { colorAccentHover.value = v } },
  { label: 'Background',     get: () => colorBackground.value,     set: (v: string) => { colorBackground.value = v } },
  { label: 'Surface',        get: () => colorSurface.value,        set: (v: string) => { colorSurface.value = v } },
  { label: 'Text',           get: () => colorText.value,           set: (v: string) => { colorText.value = v } },
  { label: 'Text Secondary', get: () => colorTextSecondary.value,  set: (v: string) => { colorTextSecondary.value = v } },
  { label: 'Border',         get: () => colorBorder.value,         set: (v: string) => { colorBorder.value = v } },
]

const darkColorDefs = [
  { label: 'Primary',        get: () => colorPrimaryDark.value,       set: (v: string) => { colorPrimaryDark.value = v } },
  { label: 'Secondary',      get: () => colorSecondaryDark.value,     set: (v: string) => { colorSecondaryDark.value = v } },
  { label: 'Accent',         get: () => colorAccentDark.value,        set: (v: string) => { colorAccentDark.value = v } },
  { label: 'Background',     get: () => colorBackgroundDark.value,    set: (v: string) => { colorBackgroundDark.value = v } },
  { label: 'Surface',        get: () => colorSurfaceDark.value,       set: (v: string) => { colorSurfaceDark.value = v } },
  { label: 'Text',           get: () => colorTextDark.value,          set: (v: string) => { colorTextDark.value = v } },
  { label: 'Text Secondary', get: () => colorTextSecondaryDark.value, set: (v: string) => { colorTextSecondaryDark.value = v } },
  { label: 'Border',         get: () => colorBorderDark.value,        set: (v: string) => { colorBorderDark.value = v } },
]

// ─── Managed services & health check helpers ──────────────────────────────────
const serviceIconMap: Record<string, unknown> = {
  domain: Globe, hosting: Server, CDN: Zap, database: Database,
  email: Mail, DNS: Globe, SSL: Shield, storage: HardDrive,
  analytics: BarChart2, other: Box
}
function serviceIcon(type: string) {
  return serviceIconMap[type] ?? Box
}

const healthAreas: { key: keyof ClientHealthCheck; label: string }[] = [
  { key: 'searchVisibility',    label: 'Search' },
  { key: 'googleBusiness',      label: 'Google Business' },
  { key: 'socialPresence',      label: 'Social' },
  { key: 'websiteDiscovery',    label: 'Website' },
  { key: 'brandConsistency',    label: 'Brand' },
  { key: 'contactAccessibility',label: 'Contact' },
  { key: 'trustCompliance',     label: 'Trust' }
]

function scoreColor(score: number): string {
  if (score >= 80) return 'var(--theme-success, #16a34a)'
  if (score >= 60) return 'var(--theme-warning, #d97706)'
  return 'var(--theme-danger, #dc2626)'
}

onMounted(() => {
  workflow.goToStep('client')
  if (showSearch.value) {
    clientApi.searchClients('').then(r => { searchResults.value = r })
  }
})
</script>

<template>
  <div class="p-6 lg:p-8 max-w-4xl">
    <WorkflowProgress />

    <div class="mb-8">
      <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">Client Setup</h1>
      <p class="mt-1" :style="{ color: 'var(--theme-text-secondary)' }">
        Load a client from the Client Dashboard, then refine their brand kit for this build.
      </p>
    </div>

    <!-- ── Load Client ─────────────────────────────────────────────────────── -->
    <div
      class="p-4 rounded-xl border mb-6"
      :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
    >
      <!-- Loaded state header -->
      <div v-if="!showSearch && clientName" class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
            :style="{ backgroundColor: colorPrimary, color: '#fff' }"
          >{{ clientName.charAt(0) }}</div>
          <div>
            <p class="font-semibold text-sm" :style="{ color: 'var(--theme-text-primary)' }">{{ clientName }}</p>
            <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Loaded from Client Dashboard</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="resyncClient"
            :disabled="resyncing"
            class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-secondary)' }"
            title="Re-fetch from Client Dashboard"
          >
            <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': resyncing }" />
            {{ resyncing ? 'Syncing…' : 'Resync' }}
          </button>
          <button
            @click="showSearch = true"
            class="text-xs px-3 py-1.5 rounded-lg transition-colors"
            :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-secondary)' }"
          >Change Client</button>
        </div>
      </div>

      <!-- Search panel -->
      <template v-else>
        <p class="text-sm font-medium mb-3" :style="{ color: 'var(--theme-text-secondary)' }">
          <Search class="inline w-4 h-4 mr-1 -mt-0.5" />Search Client Dashboard
        </p>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, email, or domain…"
          class="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 mb-3"
          :style="{
            backgroundColor: 'var(--theme-bg-secondary)',
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-text-primary)',
            '--tw-ring-color': 'var(--theme-primary)'
          }"
        />

        <div v-if="clientApi.loading.value" class="flex items-center justify-center gap-2 py-4">
          <Loader2 class="w-4 h-4 animate-spin" :style="{ color: 'var(--theme-primary)' }" />
          <span class="text-sm" :style="{ color: 'var(--theme-text-muted)' }">Searching…</span>
        </div>
        <p
          v-else-if="clientApi.error.value"
          class="text-sm text-center py-4"
          :style="{ color: 'var(--theme-status-error, #dc2626)' }"
        >Failed to search: {{ clientApi.error.value }}</p>
        <div v-else-if="searchResults.length > 0" class="space-y-2 max-h-60 overflow-y-auto">
          <button
            v-for="client in searchResults"
            :key="client.id"
            @click="loadClient(client)"
            class="w-full text-left px-4 py-3 rounded-lg border transition-colors hover:bg-(--theme-bg-hover)"
            :style="{ borderColor: 'var(--theme-border)' }"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium text-sm" :style="{ color: 'var(--theme-text-primary)' }">{{ client.name }}</span>
              <span v-if="client.contactEmail" class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">
                {{ client.contactEmail }}
              </span>
            </div>
            <div v-if="client.idealCustomer" class="text-xs mt-0.5 truncate" :style="{ color: 'var(--theme-text-muted)' }">
              {{ client.idealCustomer }}
            </div>
          </button>
        </div>
        <p
          v-else
          class="text-sm text-center py-4"
          :style="{ color: 'var(--theme-text-muted)' }"
        >{{ searchQuery.trim() ? `No clients found for "${searchQuery}"` : 'Loading clients…' }}</p>
      </template>
    </div>

    <!-- ── Import from Build Config ──────────────────────────────────────── -->
    <div
      class="p-4 rounded-xl border border-dashed mb-6 flex items-center justify-between gap-4"
      :style="{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-secondary)' }"
    >
      <div>
        <p class="text-sm font-medium" :style="{ color: 'var(--theme-text-secondary)' }">
          <FileUp class="inline w-4 h-4 mr-1 -mt-0.5" />Import from build config
        </p>
        <p class="text-xs mt-0.5" :style="{ color: 'var(--theme-text-muted)' }">
          Load a previously exported <code class="text-xs">*-build-config.json</code> file to populate all steps.
        </p>
        <p v-if="importError" class="text-xs mt-1" :style="{ color: 'var(--theme-status-error, #dc2626)' }">{{ importError }}</p>
      </div>
      <button
        @click="triggerImport"
        class="shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-secondary)' }"
      >Choose File</button>
      <input ref="fileInput" type="file" accept=".json" class="hidden" @change="importFromJson" />
    </div>

    <!-- ── Client Details Form (shown once a client is named) ──────────────── -->
    <div v-if="clientName || !showSearch" class="space-y-6">

      <!-- Basic Info -->
      <div
        class="p-6 rounded-xl border"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <div class="flex items-center gap-2 mb-4">
          <Globe class="w-5 h-5" :style="{ color: 'var(--theme-primary)' }" />
          <h2 class="font-semibold" :style="{ color: 'var(--theme-text-primary)' }">Client Details</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Client Name *</label>
            <input
              v-model="clientName"
              type="text"
              placeholder="e.g., Acme Corp"
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
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Contact Email</label>
            <input
              v-model="contactEmail"
              type="email"
              placeholder="contact@client.com"
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
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">
              Domain Slug
              <span class="font-normal opacity-60 ml-1">— from Main Website</span>
            </label>
            <div class="flex items-center gap-1.5">
              <input
                :value="domain"
                @input="handleDomainInput(($event.target as HTMLInputElement).value)"
                type="text"
                placeholder="clientname"
                class="flex-1 min-w-0 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                :style="{
                  backgroundColor: 'var(--theme-bg-secondary)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-primary)',
                  '--tw-ring-color': 'var(--theme-primary)'
                }"
              />
              <span class="text-sm shrink-0" :style="{ color: 'var(--theme-text-muted)' }">.</span>
              <input
                :value="tld"
                @input="handleTldInput(($event.target as HTMLInputElement).value)"
                type="text"
                placeholder="com"
                class="w-20 shrink-0 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                :style="{
                  backgroundColor: 'var(--theme-bg-secondary)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-primary)',
                  '--tw-ring-color': 'var(--theme-primary)'
                }"
              />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Industry</label>
            <input
              v-model="industry"
              type="text"
              placeholder="e.g., Technology, Restaurant, Real Estate"
              class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              :style="{
                backgroundColor: 'var(--theme-bg-secondary)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
                '--tw-ring-color': 'var(--theme-primary)'
              }"
            />
          </div>

          <!-- What They Offer -->
          <div class="md:col-span-2">
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">
              What They Offer
              <span class="font-normal opacity-60 ml-1">— from Health Check</span>
            </label>
            <textarea
              v-model="whatTheyOffer"
              rows="5"
              placeholder="Imported from Client Dashboard → Status & Overview"
              class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-y"
              :style="{
                backgroundColor: 'var(--theme-bg-secondary)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
                '--tw-ring-color': 'var(--theme-primary)'
              }"
            />
          </div>

          <!-- Ideal Customer -->
          <div class="md:col-span-2">
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">
              Ideal Customer
              <span class="font-normal opacity-60 ml-1">— from Health Check</span>
            </label>
            <textarea
              v-model="idealCustomer"
              rows="5"
              placeholder="Imported from Client Dashboard → Status & Overview"
              class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-y"
              :style="{
                backgroundColor: 'var(--theme-bg-secondary)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
                '--tw-ring-color': 'var(--theme-primary)'
              }"
            />
          </div>

          <!-- Business Contact (NAP) — optional, for local SEO -->
          <div class="md:col-span-2 pt-4 mt-2 border-t" :style="{ borderColor: 'var(--theme-border)' }">
            <div class="mb-3">
              <h3 class="text-sm font-semibold" :style="{ color: 'var(--theme-text-primary)' }">Business Contact (NAP)</h3>
              <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">
                Optional. Populates the footer and schema.org LocalBusiness JSON-LD. Strongly recommended for local businesses, nonprofits, churches, and HOAs — top local SEO ranking signal.
              </p>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Street Address</label>
                <input v-model="bcStreetAddress" type="text" placeholder="123 Main Street"
                  class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                  :style="{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)', '--tw-ring-color': 'var(--theme-primary)' }" />
              </div>
              <div>
                <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">City</label>
                <input v-model="bcCity" type="text" placeholder="Springfield"
                  class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                  :style="{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)', '--tw-ring-color': 'var(--theme-primary)' }" />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">State/Region</label>
                  <input v-model="bcRegion" type="text" placeholder="CO"
                    class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                    :style="{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)', '--tw-ring-color': 'var(--theme-primary)' }" />
                </div>
                <div>
                  <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Postal Code</label>
                  <input v-model="bcPostalCode" type="text" placeholder="80301"
                    class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                    :style="{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)', '--tw-ring-color': 'var(--theme-primary)' }" />
                </div>
              </div>
              <div>
                <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Country</label>
                <input v-model="bcCountry" type="text" placeholder="US"
                  class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                  :style="{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)', '--tw-ring-color': 'var(--theme-primary)' }" />
              </div>
              <div>
                <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Phone</label>
                <input v-model="bcPhone" type="tel" placeholder="(555) 123-4567"
                  class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                  :style="{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)', '--tw-ring-color': 'var(--theme-primary)' }" />
              </div>
            </div>
          </div>
        </div>

        <!-- Domain preview -->
        <div v-if="domain" class="mt-4 flex flex-wrap gap-3">
          <span
            v-for="prefix in ['', 'studio.', 'dashboard.']"
            :key="prefix"
            class="text-xs px-3 py-1.5 rounded-full font-mono"
            :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
          >{{ prefix }}{{ domain }}.{{ tld || 'com' }}</span>
        </div>

        <!-- Connected Platforms -->
        <div v-if="socialLinks.length > 0" class="mt-4 pt-4 border-t" :style="{ borderColor: 'var(--theme-border)' }">
          <p class="text-xs font-medium mb-2" :style="{ color: 'var(--theme-text-muted)' }">Connected Platforms</p>
          <div class="flex flex-wrap gap-2">
            <a
              v-for="link in socialLinks"
              :key="link.id"
              :href="link.url.startsWith('http') ? link.url : `https://${link.url}`"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors hover:bg-(--theme-bg-tertiary)"
              :style="{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }"
            >
              <ExternalLink class="w-3 h-3" />
              {{ link.label }}
            </a>
          </div>
        </div>
      </div>

      <!-- ── Brand Colors ──────────────────────────────────────────────────── -->
      <div
        class="p-6 rounded-xl border"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <div class="flex items-center gap-2 mb-4">
          <Palette class="w-5 h-5" :style="{ color: 'var(--theme-primary)' }" />
          <h2 class="font-semibold" :style="{ color: 'var(--theme-text-primary)' }">Brand Colors</h2>
        </div>

        <!-- Light Theme — 12 tokens -->
        <p class="text-xs font-medium mb-3" :style="{ color: 'var(--theme-text-muted)' }">Light Theme</p>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-5">
          <div v-for="c in lightColorDefs" :key="c.label">
            <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--theme-text-secondary)' }">{{ c.label }}</label>
            <div class="flex items-center gap-1.5">
              <input
                type="color"
                :value="c.get() || '#cccccc'"
                @input="c.set(($event.target as HTMLInputElement).value)"
                class="w-8 h-8 rounded cursor-pointer shrink-0"
                :style="{ border: '1px solid var(--theme-border)' }"
              />
              <input
                :value="c.get()"
                @input="c.set(($event.target as HTMLInputElement).value)"
                type="text"
                placeholder="#—"
                class="flex-1 min-w-0 px-2 py-1 rounded border text-xs font-mono focus:outline-none focus:ring-1"
                :style="{
                  backgroundColor: 'var(--theme-bg-secondary)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-primary)',
                  '--tw-ring-color': 'var(--theme-primary)'
                }"
              />
            </div>
          </div>
        </div>

        <!-- Dark Theme — 8 tokens -->
        <p class="text-xs font-medium mb-3" :style="{ color: 'var(--theme-text-muted)' }">Dark Theme</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div v-for="c in darkColorDefs" :key="c.label + '-dark'">
            <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--theme-text-secondary)' }">{{ c.label }}</label>
            <div class="flex items-center gap-1.5">
              <input
                type="color"
                :value="c.get() || '#1a1a2e'"
                @input="c.set(($event.target as HTMLInputElement).value)"
                class="w-8 h-8 rounded cursor-pointer shrink-0"
                :style="{ border: '1px solid var(--theme-border)' }"
              />
              <input
                :value="c.get()"
                @input="c.set(($event.target as HTMLInputElement).value)"
                type="text"
                placeholder="#—"
                class="flex-1 min-w-0 px-2 py-1 rounded border text-xs font-mono focus:outline-none focus:ring-1"
                :style="{
                  backgroundColor: 'var(--theme-bg-secondary)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-primary)',
                  '--tw-ring-color': 'var(--theme-primary)'
                }"
              />
            </div>
          </div>
        </div>

        <!-- 5-stop preview: Primary → Secondary → Accent → Surface → Background -->
        <div class="mt-4 flex rounded-lg overflow-hidden h-7">
          <div class="flex-1" :style="{ backgroundColor: colorPrimary }" :title="`Primary: ${colorPrimary}`" />
          <div class="flex-1" :style="{ backgroundColor: colorSecondary }" :title="`Secondary: ${colorSecondary}`" />
          <div class="flex-1" :style="{ backgroundColor: colorAccent }" :title="`Accent: ${colorAccent}`" />
          <div class="flex-1" :style="{ backgroundColor: colorSurface || colorBackground || '#f9fafb' }" :title="`Surface: ${colorSurface || colorBackground}`" />
          <div class="flex-1" :style="{ backgroundColor: colorBackground || '#ffffff' }" :title="`Background: ${colorBackground}`" />
        </div>
      </div>

      <!-- ── Typography ───────────────────────────────────────────────────── -->
      <div
        class="p-6 rounded-xl border"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <div class="flex items-center gap-2 mb-5">
          <Type class="w-5 h-5" :style="{ color: 'var(--theme-primary)' }" />
          <h2 class="font-semibold" :style="{ color: 'var(--theme-text-primary)' }">Typography</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Heading Font -->
          <div>
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Heading Font</label>
            <input
              v-model="headingFont"
              type="text"
              placeholder="e.g., Playfair Display"
              class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 mb-2"
              :style="{
                backgroundColor: 'var(--theme-bg-secondary)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
                '--tw-ring-color': 'var(--theme-primary)'
              }"
            />
            <!-- Quick picks -->
            <div class="flex flex-wrap gap-1.5 mb-3">
              <button
                v-for="pick in headingFontPicks"
                :key="pick"
                @click="headingFont = pick"
                class="text-xs px-2.5 py-1 rounded-full border transition-colors"
                :style="headingFont === pick
                  ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)', borderColor: 'var(--theme-primary)' }
                  : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)', borderColor: 'var(--theme-border)' }"
              >{{ pick }}</button>
            </div>
            <!-- Weight multi-select chips + italic toggle -->
            <div class="mb-3">
              <p class="text-xs mb-1.5" :style="{ color: 'var(--theme-text-muted)' }">Weights</p>
              <div class="flex items-center gap-1.5 flex-wrap">
                <button
                  v-for="w in fontWeights"
                  :key="w"
                  @click="toggleHeadingWeight(w)"
                  class="text-xs px-2 py-1 rounded-md border transition-colors"
                  :style="headingFontWeights.includes(w)
                    ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)', borderColor: 'var(--theme-primary)' }
                    : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)', borderColor: 'var(--theme-border)' }"
                >{{ w }}</button>
                <button
                  @click="headingFontStyle = headingFontStyle === 'italic' ? 'normal' : 'italic'"
                  class="px-2.5 py-1 rounded-md border text-xs transition-colors ml-1"
                  :style="headingFontStyle === 'italic'
                    ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)', borderColor: 'var(--theme-primary)' }
                    : { backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }"
                ><em>I</em></button>
              </div>
            </div>
            <!-- Preview -->
            <p
              class="text-xl leading-tight"
              :style="{
                color: 'var(--theme-text-primary)',
                fontFamily: `'${headingFont}', serif`,
                fontWeight: headingPreviewWeight,
                fontStyle: headingFontStyle
              }"
            >{{ clientName || 'Heading Preview' }}</p>
          </div>

          <!-- Body Font -->
          <div>
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Body Font</label>
            <input
              v-model="bodyFont"
              type="text"
              placeholder="e.g., Inter"
              class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 mb-2"
              :style="{
                backgroundColor: 'var(--theme-bg-secondary)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
                '--tw-ring-color': 'var(--theme-primary)'
              }"
            />
            <!-- Quick picks -->
            <div class="flex flex-wrap gap-1.5 mb-3">
              <button
                v-for="pick in bodyFontPicks"
                :key="pick"
                @click="bodyFont = pick"
                class="text-xs px-2.5 py-1 rounded-full border transition-colors"
                :style="bodyFont === pick
                  ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)', borderColor: 'var(--theme-primary)' }
                  : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)', borderColor: 'var(--theme-border)' }"
              >{{ pick }}</button>
            </div>
            <!-- Weight multi-select chips + italic toggle -->
            <div class="mb-3">
              <p class="text-xs mb-1.5" :style="{ color: 'var(--theme-text-muted)' }">Weights</p>
              <div class="flex items-center gap-1.5 flex-wrap">
                <button
                  v-for="w in fontWeights"
                  :key="w"
                  @click="toggleBodyWeight(w)"
                  class="text-xs px-2 py-1 rounded-md border transition-colors"
                  :style="bodyFontWeights.includes(w)
                    ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)', borderColor: 'var(--theme-primary)' }
                    : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)', borderColor: 'var(--theme-border)' }"
                >{{ w }}</button>
                <button
                  @click="bodyFontStyle = bodyFontStyle === 'italic' ? 'normal' : 'italic'"
                  class="px-2.5 py-1 rounded-md border text-xs transition-colors ml-1"
                  :style="bodyFontStyle === 'italic'
                    ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)', borderColor: 'var(--theme-primary)' }
                    : { backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }"
                ><em>I</em></button>
              </div>
            </div>
            <!-- Preview -->
            <p
              class="text-sm"
              :style="{
                color: 'var(--theme-text-secondary)',
                fontFamily: `'${bodyFont}', sans-serif`,
                fontWeight: '400',
                fontStyle: bodyFontStyle
              }"
            >The quick brown fox jumps over the lazy dog.</p>
          </div>
        </div>
      </div>

      <!-- ── Logo ─────────────────────────────────────────────────────────── -->
      <div
        class="p-6 rounded-xl border"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <h2 class="font-semibold mb-4" :style="{ color: 'var(--theme-text-primary)' }">Logo &amp; Identity</h2>

        <!-- Mode tabs -->
        <div class="flex gap-2 mb-4">
          <button
            @click="logoMode = 'file'"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            :style="logoMode === 'file'
              ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }
              : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-secondary)' }"
          >
            <Upload class="w-3.5 h-3.5" /> Upload File
          </button>
          <button
            @click="logoMode = 'url'"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            :style="logoMode === 'url'
              ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }
              : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-secondary)' }"
          >
            <Link class="w-3.5 h-3.5" /> From URL
          </button>
        </div>

        <!-- File upload -->
        <div v-if="logoMode === 'file'">
          <label
            class="flex flex-col items-center justify-center h-24 rounded-lg border-2 border-dashed cursor-pointer transition-colors hover:bg-(--theme-bg-secondary)"
            :style="{ borderColor: 'var(--theme-border)' }"
            for="logo-file-input"
          >
            <Upload class="w-6 h-6 mb-1" :style="{ color: 'var(--theme-text-muted)' }" />
            <span class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">
              Click to upload JPG, PNG, or SVG
            </span>
          </label>
          <input
            id="logo-file-input"
            type="file"
            accept=".jpg,.jpeg,.png,.svg"
            class="hidden"
            @change="handleLogoFile"
          />
        </div>

        <!-- URL input -->
        <div v-else>
          <input
            v-model="logoUrl"
            type="text"
            placeholder="https://example.com/logo.svg"
            class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
            :style="{
              backgroundColor: 'var(--theme-bg-secondary)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-text-primary)',
              '--tw-ring-color': 'var(--theme-primary)'
            }"
          />
        </div>

        <!-- Primary logo preview -->
        <div v-if="currentLogoSrc" class="mt-4 flex items-center gap-4">
          <div
            class="flex items-center justify-center p-3 rounded-lg border"
            :style="{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-secondary)' }"
          >
            <img
              :src="currentLogoSrc"
              alt="Logo preview"
              class="max-h-16 max-w-40 object-contain"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
          </div>
          <button
            @click="clearLogo"
            class="flex items-center gap-1 text-xs transition-colors"
            :style="{ color: 'var(--theme-text-muted)' }"
          >
            <X class="w-3.5 h-3.5" /> Remove
          </button>
        </div>

        <!-- Dark logo + Favicon + Border Radius -->
        <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

          <!-- Dark Logo -->
          <div>
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">
              Dark Logo URL
              <span class="ml-1 font-normal" :style="{ color: 'var(--theme-text-muted)' }">(for dark backgrounds)</span>
            </label>
            <input
              v-model="logoUrlDark"
              type="text"
              placeholder="https://example.com/logo-dark.svg"
              class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              :style="{
                backgroundColor: 'var(--theme-bg-secondary)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
                '--tw-ring-color': 'var(--theme-primary)'
              }"
            />
            <div v-if="logoUrlDark" class="mt-2 p-2 rounded-lg flex items-center justify-center" style="background:#111">
              <img :src="logoUrlDark" alt="Dark logo preview" class="max-h-10 max-w-32 object-contain"
                @error="($event.target as HTMLImageElement).style.display = 'none'" />
            </div>
          </div>

          <!-- Favicon -->
          <div>
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">
              Favicon URL
              <span class="ml-1 font-normal" :style="{ color: 'var(--theme-text-muted)' }">(.ico, .png, or .svg)</span>
            </label>
            <input
              v-model="logoFavicon"
              type="text"
              placeholder="https://example.com/favicon.ico"
              class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              :style="{
                backgroundColor: 'var(--theme-bg-secondary)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
                '--tw-ring-color': 'var(--theme-primary)'
              }"
            />
            <div v-if="logoFavicon" class="mt-2 flex items-center gap-2">
              <img :src="logoFavicon" alt="Favicon preview" class="w-8 h-8 object-contain rounded"
                @error="($event.target as HTMLImageElement).style.display = 'none'" />
              <span class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Favicon preview</span>
            </div>
          </div>

        </div>

        <!-- Border Radius -->
        <div class="mt-4">
          <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">
            Border Radius
            <span class="ml-1 font-normal" :style="{ color: 'var(--theme-text-muted)' }">(e.g. 0.5rem, 8px, 0)</span>
          </label>
          <div class="flex items-center gap-3">
            <input
              v-model="borderRadiusValue"
              type="text"
              placeholder="0.5rem"
              class="w-40 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              :style="{
                backgroundColor: 'var(--theme-bg-secondary)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
                '--tw-ring-color': 'var(--theme-primary)'
              }"
            />
            <div class="flex gap-2">
              <button
                v-for="preset in ['0', '0.25rem', '0.5rem', '0.75rem', '1rem']"
                :key="preset"
                @click="borderRadiusValue = preset"
                class="px-2.5 py-1 rounded text-xs transition-colors"
                :style="borderRadiusValue === preset
                  ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }
                  : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-secondary)' }"
              >{{ preset }}</button>
            </div>
            <!-- Live preview swatch -->
            <div v-if="borderRadiusValue" class="flex items-center gap-1.5 ml-auto">
              <div
                class="w-10 h-10 border-2"
                :style="{ borderColor: 'var(--theme-primary)', borderRadius: borderRadiusValue }"
              />
              <div
                class="w-10 h-6 border-2"
                :style="{ borderColor: 'var(--theme-secondary)', borderRadius: borderRadiusValue }"
              />
            </div>
          </div>
        </div>

      </div>

      <!-- ── Health Check Overview ────────────────────────────────────────── -->
      <div
        v-if="healthCheck"
        class="p-6 rounded-xl border"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <ActivitySquare class="w-5 h-5" :style="{ color: 'var(--theme-primary)' }" />
            <h2 class="font-semibold" :style="{ color: 'var(--theme-text-primary)' }">Health Check</h2>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="text-2xl font-bold"
              :style="{ color: scoreColor(healthCheck.score) }"
            >{{ healthCheck.score }}</span>
            <span class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">/100</span>
            <span v-if="healthCheck.date" class="text-xs ml-2" :style="{ color: 'var(--theme-text-muted)' }">
              {{ new Date(healthCheck.date).toLocaleDateString() }}
            </span>
          </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          <div
            v-for="area in healthAreas"
            :key="area.key"
            v-show="healthCheck[area.key] !== undefined"
            class="flex flex-col items-center gap-1 p-2 rounded-lg"
            :style="{ backgroundColor: 'var(--theme-bg-secondary)' }"
          >
            <span
              class="text-base font-bold"
              :style="{ color: scoreColor((healthCheck[area.key] as { score: number } | undefined)?.score ?? 0) }"
            >{{ (healthCheck[area.key] as { score: number } | undefined)?.score ?? '—' }}</span>
            <span class="text-xs text-center leading-tight" :style="{ color: 'var(--theme-text-muted)' }">{{ area.label }}</span>
          </div>
        </div>
      </div>

      <!-- ── Managed Infrastructure ─────────────────────────────────────── -->
      <div
        v-if="managedServices.length > 0"
        class="p-6 rounded-xl border"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <div class="flex items-center gap-2 mb-4">
          <Server class="w-5 h-5" :style="{ color: 'var(--theme-primary)' }" />
          <h2 class="font-semibold" :style="{ color: 'var(--theme-text-primary)' }">Managed Infrastructure</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div
            v-for="(svc, i) in managedServices"
            :key="svc.id ?? i"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg border"
            :style="{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-secondary)' }"
          >
            <component
              :is="serviceIcon(svc.type)"
              class="w-4 h-4 shrink-0"
              :style="{ color: 'var(--theme-primary)' }"
            />
            <div class="min-w-0 flex-1">
              <p class="text-xs font-medium truncate" :style="{ color: 'var(--theme-text-primary)' }">
                {{ svc.provider }}
                <span class="font-normal" :style="{ color: 'var(--theme-text-muted)' }"> — {{ svc.type }}</span>
              </p>
              <p v-if="svc.plan" class="text-xs truncate" :style="{ color: 'var(--theme-text-muted)' }">{{ svc.plan }}</p>
            </div>
            <span
              v-if="svc.status"
              class="text-xs px-2 py-0.5 rounded-full shrink-0"
              :style="{
                backgroundColor: svc.status === 'active' ? 'var(--theme-success-light, #dcfce7)' : 'var(--theme-warning-light, #fef3c7)',
                color: svc.status === 'active' ? 'var(--theme-success, #16a34a)' : 'var(--theme-warning, #d97706)'
              }"
            >{{ svc.status }}</span>
          </div>
        </div>
      </div>

      <!-- ── Continue ──────────────────────────────────────────────────────── -->
      <div class="mt-2 flex justify-end">
        <button
          :disabled="!canContinue"
          @click="handleContinue"
          class="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
        >
          Continue to Site Builder
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
