<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Check, ChevronDown, ChevronRight, Globe, Palette, Type,
  PanelTop, PanelBottom, LayoutTemplate, Blocks, Database,
  LayoutDashboard, PartyPopper, FileText, Zap, BarChart3,
  BookOpen, Link2, FileEdit, Download, ArrowLeft, Rocket,
  RefreshCw, PackagePlus
} from 'lucide-vue-next'
import { useWorkflowStore } from '../stores/workflow'
import { useCompositionStore } from '../stores/composition'
import { useRegistryStore } from '../stores/registry'
import { BUSINESS_TYPES } from '../data/siteBuilderData'
import type { PortfolioEntry, SchemaRequirement, ClientInfo } from '../types/registry'
import WorkflowProgress from '../components/WorkflowProgress.vue'

const route  = useRoute()
const router = useRouter()
const workflow     = useWorkflowStore()
const composition  = useCompositionStore()
const registry     = useRegistryStore()

// ─── Mode detection ──────────────────────────────────────────────────────────
const entryId         = computed(() => route.query.entryId as string | undefined)
const isPortfolioMode = computed(() => !!entryId.value)
const isExtendMode    = computed(() => workflow.extendMode)
const activeEntry     = computed(() =>
  entryId.value ? workflow.savedPortfolio.find(e => e.id === entryId.value) : null
)
const extendSourceEntry = computed(() =>
  workflow.extendSourceEntryId
    ? workflow.savedPortfolio.find(e => e.id === workflow.extendSourceEntryId)
    : null
)

// ─── Export state ───────────────────────────────────────────────────────────
const exported = ref(false)
const exportedFilename = ref('')

// ─── Domain (works in both modes) ───────────────────────────────────────────
const client = computed(() => workflow.clientInfo)
const domain = computed(() => {
  if (isPortfolioMode.value && activeEntry.value) {
    return activeEntry.value.domain.replace(/\.com$/, '')
  }
  return composition.composition.name
    ? composition.composition.name.toLowerCase().replace(/\s+/g, '')
    : client.value?.domain ?? 'project'
})

// ─── Active-mode: site selections ───────────────────────────────────────────
const headerName   = computed(() => composition.selectedHeaderVariant?.name ?? null)
const footerName   = computed(() => composition.selectedFooterVariant?.name ?? null)
const templateName = computed(() => composition.selectedTemplate?.name ?? null)
const pageBlocks   = computed(() => {
  const allIds = new Set<string>()
  for (const page of composition.siteBuilder.sitemapPages) {
    for (const id of page.blocks ?? []) allIds.add(id)
    for (const ids of Object.values(page.slotBlocks ?? {})) {
      for (const id of ids ?? []) allIds.add(id)
    }
  }
  return [...allIds]
})
const blockCount = computed(() => pageBlocks.value.length)
const blockNames = computed(() =>
  pageBlocks.value.map(id => registry.getBlockById(id)?.name).filter(Boolean) as string[]
)
const schemaCount = computed(() => composition.mergedSchemaRequirements.length)
const fieldCount  = computed(() =>
  composition.mergedSchemaRequirements.reduce((sum, s) => sum + s.fields.length, 0)
)
const pageCount = computed(() => composition.siteBuilder.sitemapPages.length)

const dashboardConfig    = computed(() => composition.siteBuilder.dashboardConfig)
const enabledWidgetCount = computed(() => dashboardConfig.value.enabledWidgets.length)
const quickActionCount   = computed(() => dashboardConfig.value.quickActions.filter(a => a.label && a.url).length)
const tutorialCount      = computed(() => dashboardConfig.value.tutorialVideos.filter(v => v.title).length)
const linkCount          = computed(() => dashboardConfig.value.helpfulLinks.filter(l => l.title && l.url).length)
const contentEditorCount = computed(() => dashboardConfig.value.contentEditors.filter(e => e.label).length)

const WIDGET_ICONS: Record<string, unknown>  = {
  quickActions: Zap, analytics: BarChart3, tutorials: BookOpen, links: Link2, contentEditor: FileEdit
}
const WIDGET_LABELS: Record<string, string> = {
  quickActions: 'Quick Actions', analytics: 'Analytics', tutorials: 'Tutorial Videos',
  links: 'Helpful Links', contentEditor: 'Content Editors'
}

// ─── Build config checklist ──────────────────────────────────────────────────
const checklist = computed(() => [
  { label: 'Client information set',           done: !!client.value?.name },
  { label: 'Brand colors configured',          done: !!client.value?.brandKit.colors.primary },
  { label: 'Header selected',                  done: !!headerName.value },
  { label: 'Footer selected',                  done: !!footerName.value },
  { label: 'Page template chosen',             done: !!templateName.value },
  { label: 'Pages added to sitemap',           done: pageCount.value > 0 },
  { label: 'Content blocks assigned to pages', done: blockCount.value > 0 },
  { label: 'CMS schemas generated',            done: schemaCount.value > 0 },
  { label: 'Dashboard widgets configured',     done: enabledWidgetCount.value > 0 },
  { label: 'Billing Stripe Customer ID set',   done: !!dashboardConfig.value.billing?.stripeCustomerId },
  { label: 'Content Kit configured',            done: dashboardConfig.value.contentKit?.enabled && dashboardConfig.value.contentKit.sections.some(s => s.enabled) },
])
const allChecksPassed = computed(() => checklist.value.every(c => c.done))

// ─── Deployment phases (46 items) ───────────────────────────────────────────
interface ChecklistItem { id: string; label: string }
interface Phase { id: string; label: string; items: ChecklistItem[] }

const PHASES: Phase[] = [
  {
    id: 'p1',
    label: 'Local Setup & Testing',
    items: [
      { id: 'p1-1',  label: 'Run `pnpm install` in website project' },
      { id: 'p1-2',  label: 'Run `pnpm install` in Sanity studio project' },
      { id: 'p1-3',  label: 'Run `pnpm install` in dashboard project' },
      { id: 'p1-4',  label: 'Website runs locally (`pnpm dev`) — all pages load' },
      { id: 'p1-5',  label: 'Sanity studio runs locally (`pnpm dev`) — schemas load correctly' },
      { id: 'p1-6',  label: 'Verify Sanity project ID is set in studio `.env` (must match your Sanity project)' },
      { id: 'p1-7',  label: 'Run seed script from studio directory: `npx sanity exec seed.ts --with-user-token`' },
      { id: 'p1-8',  label: 'Dashboard runs locally (`pnpm dev`, or `netlify dev` to test functions) — all widgets render' },
      { id: 'p1-9',  label: 'All page routes verified in local website' },
      { id: 'p1-10', label: 'Header and footer display correctly' },
      { id: 'p1-11', label: 'Content blocks render correctly on each page' },
      { id: 'p1-12', label: 'Mobile responsiveness tested (Firefox Developer Edition)' },
      { id: 'p1-13', label: 'Sanity content appears in local website' },
      { id: 'p1-14', label: 'Auth0 flow tested locally (if enabled)' },
      { id: 'p1-15', label: '`pnpm build` succeeds — no type errors' },
      { id: 'p1-16', label: 'Lighthouse score checked — no critical issues' },
      { id: 'p1-17', label: 'Billing page loads — subscription card and portal button render' },
    ]
  },
  {
    id: 'p2',
    label: 'GitHub Setup',
    items: [
      { id: 'p2-1', label: 'GitHub repo created: [client-slug]-website' },
      { id: 'p2-2', label: 'GitHub repo created: [client-slug]-studio' },
      { id: 'p2-3', label: 'GitHub repo created: [client-slug]-dashboard' },
      { id: 'p2-4', label: 'All three repos pushed to GitHub (main branch)' },
      { id: 'p2-5', label: '`.env.example` added to each repo (keys only, no values)' },
      { id: 'p2-6', label: '`README.md` added to each repo with setup instructions' },
    ]
  },
  {
    id: 'p3',
    label: 'Staging Environment',
    items: [
      { id: 'p3-1', label: 'Netlify site created for website — connected to GitHub repo' },
      { id: 'p3-2', label: 'Netlify site created for dashboard — connected to GitHub repo' },
      { id: 'p3-3', label: 'All env vars added to Netlify website site settings' },
      { id: 'p3-4', label: 'All env vars added to Netlify dashboard site settings' },
      { id: 'p3-5', label: 'Website staging deploy succeeds — no build errors' },
      { id: 'p3-6', label: 'Dashboard staging deploy succeeds — no build errors' },
      { id: 'p3-7', label: 'Sanity studio deployed (`pnpm deploy`)' },
      { id: 'p3-8', label: 'Sanity CORS origins include all staging URLs' },
      { id: 'p3-9', label: 'Create build hook in Netlify: Site Settings → Build & Deploy → Build Hooks → Add build hook → Copy URL → paste into Client Dashboard → Managed Services → Netlify → Build Hook URL → Add as VITE_NETLIFY_BUILD_HOOK_URL in Netlify env vars for the dashboard site' },
      { id: 'p3-10', label: 'Smoke test: all three staging URLs load correctly' },
    ]
  },
  {
    id: 'p4',
    label: 'Production Launch',
    items: [
      { id: 'p4-1',  label: 'Domain confirmed/purchased: [clientdomain.com]' },
      { id: 'p4-2',  label: 'Custom domain `[clientdomain.com]` added to Netlify website site' },
      { id: 'p4-3',  label: 'Custom domain `dashboard.[clientdomain.com]` added to Netlify' },
      { id: 'p4-4',  label: 'Sanity studio deployed at `studio.[clientdomain.com]`' },
      { id: 'p4-5',  label: 'SSL certificates active for all three production domains' },
      { id: 'p4-6',  label: 'VITE_SITE_URL updated to `https://[clientdomain.com]` in Netlify env vars' },
      { id: 'p4-7',  label: 'Sanity CORS origins updated to include all production domains' },
      { id: 'p4-8',  label: 'Production website deployed — site live at `[clientdomain.com]`' },
      { id: 'p4-9',  label: 'Production dashboard deployed — live at `dashboard.[clientdomain.com]`' },
      { id: 'p4-10', label: 'All production page routes tested' },
      { id: 'p4-11', label: 'Sanity studio accessible at `studio.[clientdomain.com]`' },
      { id: 'p4-12', label: 'Simple Analytics connected and verified — Google Analytics added only if client requested' },
      { id: 'p4-13', label: 'Contact forms and interactive features tested in production' },
      { id: 'p4-14', label: 'Client access credentials and all links delivered' },
      { id: 'p4-15', label: 'Stripe Customer Portal settings reviewed (Settings → Customer Portal in Stripe Dashboard)' },
      { id: 'p4-16', label: 'Billing page tested — portal redirect works, subscription + payment data displays correctly' },
    ]
  }
]

const TOTAL_ITEMS = 49

// ─── Deployment checklist state ─────────��───────────────────────────────────
const checkedItems = computed(() =>
  isPortfolioMode.value
    ? (activeEntry.value?.finalizeProgress ?? {})
    : workflow.finalizeProgress
)

function toggleItem(itemId: string) {
  const current = { ...checkedItems.value }
  current[itemId] = !current[itemId]
  if (isPortfolioMode.value && entryId.value) {
    workflow.updatePortfolioFinalizeProgress(entryId.value, current)
  } else {
    workflow.setFinalizeProgress(current)
  }
}

const totalChecked      = computed(() => Object.values(checkedItems.value).filter(Boolean).length)
const allPhasesComplete = computed(() => totalChecked.value === TOTAL_ITEMS)

function phaseChecked(phase: Phase): number {
  return phase.items.filter(item => checkedItems.value[item.id]).length
}

// ─── Phase collapse ──────────────────────────────────────────────────────────
const collapsedPhases = ref<Record<string, boolean>>({})
function togglePhase(phaseId: string) {
  collapsedPhases.value[phaseId] = !collapsedPhases.value[phaseId]
}

// ─── Label substitution ──────────────────────────────────────────────────────
function resolveLabel(label: string): string {
  return label
    .replace(/\[client-slug\]/g, domain.value)
    .replace(/\[clientdomain\.com\]/g, `${domain.value}.com`)
}

// ─── Export helpers ──────────────────────────────────────────────────────────
function toComponentName(id: string): string {
  return id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Injects siteSettings defaults (craftedBy attribution + businessContact NAP) into
 * the merged schemas so the build-script seeds them into the siteSettings singleton.
 * Never overwrites existing defaultValues — only fills in siteSettings entries.
 */
function injectSiteSettingsDefaults(schemas: SchemaRequirement[], c: ClientInfo | null): SchemaRequirement[] {
  const bc = c?.businessContact
  const siteSettingsDefaults: Record<string, unknown> = {
    craftedBy: 'Crafted by Phifer Web Solutions'
  }
  if (bc && (bc.streetAddress || bc.phone || bc.city || bc.email)) {
    siteSettingsDefaults.businessContact = {
      ...(bc.businessName  ? { businessName:  bc.businessName  } : { businessName: c?.name }),
      ...(bc.streetAddress ? { streetAddress: bc.streetAddress } : {}),
      ...(bc.city          ? { city:          bc.city          } : {}),
      ...(bc.region        ? { region:        bc.region        } : {}),
      ...(bc.postalCode    ? { postalCode:    bc.postalCode    } : {}),
      ...(bc.country       ? { country:       bc.country       } : {}),
      ...(bc.phone         ? { phone:         bc.phone         } : {}),
      ...(bc.email         ? { email:         bc.email         } : { email: c?.contactEmail })
    }
  }

  return schemas.map(s => {
    if (s.documentType !== 'siteSettings') return s
    return { ...s, defaultValues: { ...siteSettingsDefaults, ...(s.defaultValues ?? {}) } }
  })
}

function buildExportConfig() {
  const sb = composition.siteBuilder
  const c  = client.value
  const businessTypeInfo = BUSINESS_TYPES.find(t => t.id === sb.businessType) ?? null

  const headerVariant   = composition.composition.header          ? registry.getVariantById(composition.composition.header) : null
  const footerVariant   = composition.composition.footer          ? registry.getVariantById(composition.composition.footer) : null
  const templateVariant = composition.composition.defaultTemplate ? registry.getTemplateById(composition.composition.defaultTemplate) : null

  function resolveBlock(id: string) {
    const b = registry.getBlockById(id)
    if (!b) return { id, componentName: toComponentName(id) }
    return {
      id: b.id, componentName: toComponentName(b.id),
      name: b.name, category: b.category, description: b.description,
      schemaRequirements: b.schemaRequirements ?? [],
      ...(b.styleNotes ? { styleNotes: b.styleNotes } : {})
    }
  }

  // Map sitemap legal page IDs to enabledLegalPages keys
  const legalIdToKey: Record<string, keyof typeof sb.enabledLegalPages> = {
    privacy: 'privacyPolicy',
    terms: 'termsAndConditions',
    accessibility: 'accessibilityStatement',
    cookie: 'cookiePolicy'
  }
  const isLegalPageEnabled = (page: { id: string; isLegal?: boolean }) => {
    if (!page.isLegal) return true
    const key = legalIdToKey[page.id]
    return !key || sb.enabledLegalPages[key]
  }

  const pages = sb.sitemapPages.filter(isLegalPageEnabled).map(page => {
    const pageTemplate = page.template ? registry.getTemplateById(page.template) : null
    const slots: Record<string, ReturnType<typeof resolveBlock>[]> = {
      content: (page.blocks ?? []).map(resolveBlock)
    }
    for (const [slot, ids] of Object.entries(page.slotBlocks ?? {})) {
      slots[slot] = (ids ?? []).map(resolveBlock)
    }
    return {
      id: page.id, name: page.name, slug: page.slug, nav: page.nav,
      isCore: page.isCore, isLegal: page.isLegal, isEnrichOnly: page.isEnrichOnly,
      notes: page.notes ?? null, metaDescription: page.metaDescription ?? null,
      template: pageTemplate
        ? { id: pageTemplate.id, componentName: toComponentName(pageTemplate.id), name: pageTemplate.name }
        : page.template ? { id: page.template, componentName: toComponentName(page.template) } : null,
      slots
    }
  })

  const sanityDocumentTypes = [...new Set([
    'siteSettings', 'navigation', 'page', 'legalPage',
    ...composition.mergedSchemaRequirements.map(r => r.documentType)
  ])]
  // Upgrade @type to LocalBusiness when full NAP is present (better local SEO than Organization)
  const bc = c?.businessContact
  const hasFullAddress = !!(bc?.streetAddress && bc?.city)
  const jsonLdType = hasFullAddress && (!businessTypeInfo?.schemaType || businessTypeInfo.schemaType === 'Organization')
    ? 'LocalBusiness'
    : (businessTypeInfo?.schemaType ?? 'Organization')
  const schemaJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type':    jsonLdType,
    name:       bc?.businessName || c?.name || 'Your Business',
    url:        `https://${c?.domain ?? 'example.com'}`
  }
  if (bc?.email || c?.contactEmail) schemaJsonLd['email'] = bc?.email || c?.contactEmail
  if (bc?.phone) schemaJsonLd['telephone'] = bc.phone
  if (hasFullAddress) {
    schemaJsonLd['address'] = {
      '@type':           'PostalAddress',
      streetAddress:     bc!.streetAddress,
      addressLocality:   bc!.city,
      ...(bc!.region     ? { addressRegion: bc!.region } : {}),
      ...(bc!.postalCode ? { postalCode: bc!.postalCode } : {}),
      addressCountry:    bc!.country || 'US'
    }
  }

  const siteUrl = sb.envConfig.siteUrl || (c?.domain ? `https://${c.domain}` : '')
  const env: Record<string, string> = {
    VITE_SANITY_PROJECT_ID:  sb.envConfig.sanityProjectId,
    VITE_SANITY_DATASET:     sb.envConfig.sanityDataset || 'production',
    VITE_SANITY_API_VERSION: '2024-01-01',
    VITE_SITE_URL:           siteUrl
  }
  if (sb.envConfig.auth0Domain)   env['VITE_AUTH0_DOMAIN']    = sb.envConfig.auth0Domain
  if (sb.envConfig.auth0ClientId) env['VITE_AUTH0_CLIENT_ID'] = sb.envConfig.auth0ClientId

  const colors = c?.brandKit?.colors
  const fonts  = c?.brandKit?.fonts ?? []
  const cssVars: Record<string, string> = {}
  if (colors) {
    if (colors.primary)   cssVars['--color-primary']   = colors.primary
    if (colors.secondary) cssVars['--color-secondary'] = colors.secondary
    if (colors.accent)    cssVars['--color-accent']    = colors.accent
    if (colors.neutral)   cssVars['--color-neutral']   = colors.neutral
  }
  const headingFont = fonts.find(f => f.category === 'heading')
  const bodyFont    = fonts.find(f => f.category === 'body')
  if (headingFont) cssVars['--font-heading'] = headingFont.name
  if (bodyFont)    cssVars['--font-body']    = bodyFont.name

  return {
    meta: {
      exportedAt:  new Date().toISOString(),
      version:     '1.0',
      projectName: c?.name ?? composition.composition.name ?? 'Unnamed Project'
    },
    client: c ?? null,
    project: {
      name: composition.composition.name,
      bundle: sb.bundle, businessType: sb.businessType, businessTypeInfo,
      formatId: composition.composition.formatId,
      domains: {
        main:      `${domain.value}.com`,
        studio:    `studio.${domain.value}.com`,
        dashboard: `dashboard.${domain.value}.com`
      },
      isPublic: sb.isPublic, projectMode: sb.projectMode
    },
    env, cssVars,
    site: {
      header: headerVariant ? {
        id: headerVariant.id, componentName: toComponentName(headerVariant.id),
        name: headerVariant.name, description: headerVariant.description,
        authEnabled: composition.composition.headerAuthEnabled,
        darkModeEnabled: composition.composition.headerDarkModeEnabled,
        schemaRequirements: headerVariant.schemaRequirements ?? [],
        ...(headerVariant.styleNotes ? { styleNotes: headerVariant.styleNotes } : {})
      } : null,
      footer: footerVariant ? {
        id: footerVariant.id, componentName: toComponentName(footerVariant.id),
        name: footerVariant.name, description: footerVariant.description,
        schemaRequirements: footerVariant.schemaRequirements ?? [],
        ...(footerVariant.styleNotes ? { styleNotes: footerVariant.styleNotes } : {})
      } : null,
      defaultTemplate: templateVariant ? {
        id: templateVariant.id, componentName: toComponentName(templateVariant.id),
        name: templateVariant.name, description: templateVariant.description,
        layout: templateVariant.layout ?? [],
        schemaRequirements: templateVariant.schemaRequirements ?? [],
        ...(templateVariant.styleNotes ? { styleNotes: templateVariant.styleNotes } : {})
      } : null,
      pages,
      navigation: {
        primary: sb.sitemapPages.filter(p => (p.nav === 'primary' || p.nav === 'both') && isLegalPageEnabled(p)).map(p => ({ name: p.name, slug: p.slug })),
        footer:  sb.sitemapPages.filter(p => (p.nav === 'footer'  || p.nav === 'both') && isLegalPageEnabled(p)).map(p => ({ name: p.name, slug: p.slug }))
      }
    },
    cms: { sanityDocumentTypes, schemas: injectSiteSettingsDefaults(composition.mergedSchemaRequirements, c), schemaJsonLd },
    legal: {
      enabledPages: sb.enabledLegalPages,
      ...(sb.enabledLegalPages.privacyPolicy          ? { privacyPolicy:          sb.legalContent.privacyPolicy ?? '' } : {}),
      ...(sb.enabledLegalPages.termsAndConditions      ? { termsAndConditions:     sb.legalContent.termsAndConditions ?? '' } : {}),
      ...(sb.enabledLegalPages.accessibilityStatement  ? { accessibilityStatement: sb.legalContent.accessibilityStatement ?? '' } : {}),
      ...(sb.enabledLegalPages.cookiePolicy            ? { cookiePolicy:           sb.legalContent.cookiePolicy ?? '' } : {})
    },
    dashboard: sb.dashboardConfig,
    ...(sb.appScreens.length > 0 || sb.dataModel.length > 0
      ? { app: { screens: sb.appScreens, dataModel: sb.dataModel } }
      : {})
  }
}

function exportProject() {
  const output = buildExportConfig()
  const filename = `${domain.value}-build-config.json`
  downloadFile(JSON.stringify(output, null, 2), filename)
  exportedFilename.value = filename
  exported.value = true
}

function reexportEntryConfig() {
  if (!activeEntry.value?.buildConfigJson) return
  const slug = activeEntry.value.domain.replace(/\.com$/, '')
  downloadFile(activeEntry.value.buildConfigJson, `${slug}-build-config.json`)
}

function handleComplete() {
  const c  = client.value
  const sb = composition.siteBuilder
  const siteUrl = sb.envConfig.siteUrl || (c?.domain ? `https://${c.domain}` : `https://${domain.value}.com`)

  const entry: PortfolioEntry = {
    id:              c?.id ?? `project-${Date.now()}`,
    clientId:        c?.id ?? '',
    clientName:      c?.name ?? composition.composition.name ?? 'Unnamed Client',
    projectName:     composition.composition.name || c?.name || 'Unnamed Project',
    domain:          `${domain.value}.com`,
    logoUrl:         c?.brandKit?.logos?.primary ?? c?.brandKit?.logoUrl ?? null,
    siteUrl,
    studioUrl:       `https://studio.${domain.value}.com`,
    dashboardUrl:    `https://dashboard.${domain.value}.com`,
    businessType:    sb.businessType,
    status:          'building',
    completedAt:     new Date().toISOString(),
    finalizeProgress: { ...workflow.finalizeProgress }
  }

  entry.buildConfigJson = JSON.stringify(buildExportConfig(), null, 2)

  workflow.completeStep('finalize')
  workflow.addPortfolioEntry(entry)
  workflow.resetWorkflow()
  router.push('/products/portfolio')
}

// ─── Extend mode: delta export ───────────────────────────────────────────────
const extendSnapshotIds = computed(() => new Set(workflow.extendSnapshot?.pageIds ?? []))

const newPages = computed(() =>
  composition.siteBuilder.sitemapPages.filter(p => !extendSnapshotIds.value.has(p.id))
)

function buildDeltaConfig() {
  const sb = composition.siteBuilder
  const c  = client.value

  function resolveBlockDelta(id: string) {
    const b = registry.getBlockById(id)
    if (!b) return { id, componentName: toComponentName(id) }
    return {
      id: b.id, componentName: toComponentName(b.id),
      name: b.name, category: b.category, description: b.description,
      schemaRequirements: b.schemaRequirements ?? [],
      ...(b.styleNotes ? { styleNotes: b.styleNotes } : {})
    }
  }

  const newPagesExport = newPages.value.map(page => {
    const pageTemplate = page.template ? registry.getTemplateById(page.template) : null
    const slots: Record<string, ReturnType<typeof resolveBlockDelta>[]> = {
      content: (page.blocks ?? []).map(resolveBlockDelta)
    }
    for (const [slot, ids] of Object.entries(page.slotBlocks ?? {})) {
      slots[slot] = (ids ?? []).map(resolveBlockDelta)
    }
    return {
      id: page.id, name: page.name, slug: page.slug, nav: page.nav,
      isCore: page.isCore, isLegal: page.isLegal, isEnrichOnly: page.isEnrichOnly,
      notes: page.notes ?? null, metaDescription: page.metaDescription ?? null,
      template: pageTemplate
        ? { id: pageTemplate.id, componentName: toComponentName(pageTemplate.id), name: pageTemplate.name }
        : page.template ? { id: page.template, componentName: toComponentName(page.template) } : null,
      slots
    }
  })

  return {
    meta: {
      exportedAt:    new Date().toISOString(),
      version:       '1.0',
      projectName:   c?.name ?? composition.composition.name ?? 'Unnamed Project',
      deltaMode:     true,
      baseProject:   `${domain.value}.com`
    },
    site: {
      newPages: newPagesExport,
      newNavigation: {
        primary: newPages.value.filter(p => p.nav === 'primary' || p.nav === 'both').map(p => ({ name: p.name, slug: p.slug })),
        footer:  newPages.value.filter(p => p.nav === 'footer'  || p.nav === 'both').map(p => ({ name: p.name, slug: p.slug }))
      }
    },
    // All current schemas — safe to re-apply additively to existing Sanity project
    cms: { schemas: composition.mergedSchemaRequirements },
    // Full current dashboard config — additive to apply
    dashboard: sb.dashboardConfig
  }
}

function exportDelta() {
  const output = buildDeltaConfig()
  const filename = `${domain.value}-build-config-delta.json`
  downloadFile(JSON.stringify(output, null, 2), filename)
  exportedFilename.value = filename
  exported.value = true
}

function handleCompleteExtension() {
  // 1. Download the delta config
  exportDelta()

  // 2. Update the portfolio entry's buildConfigJson to the new full state
  if (extendSourceEntry.value) {
    const updatedEntry = {
      ...extendSourceEntry.value,
      buildConfigJson: JSON.stringify(buildExportConfig(), null, 2)
    }
    workflow.addPortfolioEntry(updatedEntry)
  }

  // 3. Exit extend mode, reset workflow, return to portfolio
  workflow.exitExtendMode()
  workflow.resetWorkflow()
  router.push('/products/portfolio')
}

if (!isPortfolioMode.value && !isExtendMode.value) {
  workflow.goToStep('finalize')
}
</script>

<template>
  <div class="p-6 lg:p-8 max-w-4xl">

    <!-- ─── PORTFOLIO MODE: header ───────────────────────────────────────── -->
    <template v-if="isPortfolioMode">
      <div class="mb-6 flex items-start gap-4">
        <button
          @click="router.push('/products/portfolio')"
          class="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors hover:bg-(--theme-bg-hover) shrink-0 mt-1"
          :style="{ color: 'var(--theme-text-secondary)' }"
        >
          <ArrowLeft class="w-4 h-4" />
          Portfolio
        </button>
        <div class="flex-1">
          <div class="flex items-center gap-3 flex-wrap">
            <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">
              {{ activeEntry?.clientName ?? 'Project' }}
            </h1>
            <span
              class="text-xs font-mono px-2 py-1 rounded"
              :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
            >{{ activeEntry?.domain }}</span>
          </div>
          <p class="mt-1 text-sm" :style="{ color: 'var(--theme-text-secondary)' }">
            Deployment checklist — track post-build progress for this project.
          </p>
        </div>
        <button
          v-if="activeEntry?.buildConfigJson"
          @click="reexportEntryConfig"
          class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors shrink-0"
          :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
        >
          <Download class="w-4 h-4" />
          Export Config
        </button>
      </div>

      <!-- Not found -->
      <div
        v-if="!activeEntry"
        class="p-8 rounded-xl border text-center"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <p :style="{ color: 'var(--theme-text-muted)' }">Project not found.</p>
      </div>
    </template>

    <!-- ─── ACTIVE MODE: header + config summary ─────────────────────────── -->
    <template v-else>
      <WorkflowProgress />

      <!-- Extend mode header -->
      <template v-if="isExtendMode">
        <div class="mb-6 flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <RefreshCw class="w-4 h-4" :style="{ color: 'var(--theme-warning)' }" />
              <span class="text-xs font-semibold uppercase tracking-widest" :style="{ color: 'var(--theme-warning)' }">Extend Mode</span>
            </div>
            <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">
              Extending {{ client?.name ?? domain }}
            </h1>
            <p class="mt-1" :style="{ color: 'var(--theme-text-secondary)' }">
              Export the delta config (new additions only), then complete the extension.
            </p>
          </div>
          <button
            @click="exportDelta"
            class="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shrink-0"
            :style="{ backgroundColor: 'var(--theme-warning)', color: 'var(--theme-text-inverse)' }"
          >
            <Download class="w-4 h-4" />
            Export Delta Config
          </button>
        </div>

        <!-- Scaffold instructions (shown after delta export) -->
        <div
          v-if="exported"
          class="mb-6 p-5 rounded-xl border-2"
          :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-warning)' }"
        >
          <div class="flex items-center gap-2 mb-3">
            <Rocket class="w-5 h-5" :style="{ color: 'var(--theme-warning)' }" />
            <h3 class="font-bold text-sm" :style="{ color: 'var(--theme-text-primary)' }">Next: Extend the Project</h3>
          </div>
          <p class="text-sm mb-3" :style="{ color: 'var(--theme-text-secondary)' }">
            Move <code class="px-1.5 py-0.5 rounded text-xs font-mono" :style="{ backgroundColor: 'var(--theme-bg-tertiary)' }">{{ exportedFilename }}</code> into <code class="px-1.5 py-0.5 rounded text-xs font-mono" :style="{ backgroundColor: 'var(--theme-bg-tertiary)' }">pws-scaffolder/projects/</code>, then run:
          </p>
          <div
            class="p-3 rounded-lg font-mono text-sm select-all cursor-pointer"
            :style="{ backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-primary)' }"
          >
            cd ~/Desktop/Business\ Pipeline/build-script/pws-scaffolder<br>
            node scaffold.js extend ./projects/{{ exportedFilename }}
          </div>
          <p class="text-xs mt-2" :style="{ color: 'var(--theme-text-muted)' }">
            This adds new pages, schemas, and dashboard items without overwriting existing files.
          </p>
        </div>

        <!-- Delta summary card -->
        <div
          class="p-5 rounded-xl border mb-6"
          :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
        >
          <div class="flex items-center gap-2 mb-3">
            <PackagePlus class="w-4 h-4" :style="{ color: 'var(--theme-warning)' }" />
            <h3 class="font-semibold text-sm" :style="{ color: 'var(--theme-text-primary)' }">New Additions</h3>
          </div>
          <div v-if="newPages.length > 0" class="space-y-1.5">
            <div v-for="page in newPages" :key="page.id" class="flex items-center gap-2 text-xs">
              <Globe class="w-3.5 h-3.5 shrink-0" :style="{ color: 'var(--theme-primary)' }" />
              <span :style="{ color: 'var(--theme-text-primary)' }">{{ page.name }}</span>
              <span class="font-mono" :style="{ color: 'var(--theme-text-muted)' }">{{ page.slug }}</span>
              <span v-if="page.blocks?.length" class="ml-auto" :style="{ color: 'var(--theme-text-muted)' }">
                {{ page.blocks.length }} block{{ page.blocks.length === 1 ? '' : 's' }}
              </span>
            </div>
          </div>
          <p v-else class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">
            No new pages yet — go to Sitemap to add pages.
          </p>
        </div>
      </template>

      <!-- Normal active mode header -->
      <template v-else>
        <div class="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">Finalize Project</h1>
            <p class="mt-1" :style="{ color: 'var(--theme-text-secondary)' }">
              Review your configuration, export the build config, then track deployment.
            </p>
          </div>
          <button
            @click="exportProject"
            class="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shrink-0"
            :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
          >
            <Download class="w-4 h-4" />
            Export Build Config
          </button>
        </div>

        <!-- Scaffold instructions (shown after export) -->
        <div
          v-if="exported"
          class="mb-6 p-5 rounded-xl border-2"
          :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-primary)' }"
        >
          <div class="flex items-center gap-2 mb-3">
            <Rocket class="w-5 h-5" :style="{ color: 'var(--theme-primary)' }" />
            <h3 class="font-bold text-sm" :style="{ color: 'var(--theme-text-primary)' }">Next: Scaffold the Project</h3>
          </div>
          <p class="text-sm mb-3" :style="{ color: 'var(--theme-text-secondary)' }">
            Move <code class="px-1.5 py-0.5 rounded text-xs font-mono" :style="{ backgroundColor: 'var(--theme-bg-tertiary)' }">{{ exportedFilename }}</code> into <code class="px-1.5 py-0.5 rounded text-xs font-mono" :style="{ backgroundColor: 'var(--theme-bg-tertiary)' }">pws-scaffolder/projects/</code>, then run:
          </p>
          <div
            class="p-3 rounded-lg font-mono text-sm select-all cursor-pointer"
            :style="{ backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-primary)' }"
          >
            cd ~/Desktop/Business\ Pipeline/build-script/pws-scaffolder<br>
            node scaffold.js all ./projects/{{ exportedFilename }}
          </div>
          <p class="text-xs mt-2" :style="{ color: 'var(--theme-text-muted)' }">
            This creates <strong>frontend/</strong>, <strong>studio/</strong>, and <strong>dashboard/</strong> in one step. The config is automatically archived after a successful scaffold.
          </p>
        </div>
      </template>

      <!-- Project Name + Config Summary (active mode only, not extend mode) -->
      <div
        v-if="client && !isExtendMode"
        class="p-6 rounded-xl border mb-6"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <h2 class="text-xl font-bold mb-4" :style="{ color: 'var(--theme-text-primary)' }">{{ client.name }}</h2>
        <div class="mb-4">
          <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">
            Project Name
            <span class="ml-1 font-normal" :style="{ color: 'var(--theme-text-muted)' }">(used for domain slug)</span>
          </label>
          <input
            :value="composition.composition.name"
            @input="composition.setProjectName(($event.target as HTMLInputElement).value)"
            type="text"
            :placeholder="client.name"
            class="w-full max-w-sm px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
            :style="{
              backgroundColor: 'var(--theme-bg-secondary)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-text-primary)',
              '--tw-ring-color': 'var(--theme-primary)'
            }"
          />
        </div>
        <div class="flex flex-wrap gap-3">
          <span
            v-for="prefix in ['', 'studio.', 'dashboard.']"
            :key="prefix"
            class="text-xs px-3 py-1.5 rounded-full font-mono"
            :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
          >{{ prefix }}{{ domain }}.com</span>
        </div>
      </div>

      <!-- Config Summary Cards (active mode only) -->
      <div v-if="!isExtendMode" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- Brand Kit -->
        <div
          v-if="client"
          class="p-5 rounded-xl border"
          :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
        >
          <div class="flex items-center gap-2 mb-3">
            <Palette class="w-4 h-4" :style="{ color: 'var(--theme-primary)' }" />
            <h3 class="font-semibold text-sm" :style="{ color: 'var(--theme-text-primary)' }">Brand Kit</h3>
          </div>
          <div class="flex rounded-lg overflow-hidden h-6 mb-3">
            <div class="flex-1" :style="{ backgroundColor: client.brandKit.colors.primary }" />
            <div class="flex-1" :style="{ backgroundColor: client.brandKit.colors.secondary }" />
            <div class="flex-1" :style="{ backgroundColor: client.brandKit.colors.accent }" />
            <div class="flex-1" :style="{ backgroundColor: client.brandKit.colors.neutral }" />
          </div>
          <div class="flex items-center gap-2">
            <Type class="w-3.5 h-3.5" :style="{ color: 'var(--theme-text-muted)' }" />
            <span class="text-xs" :style="{ color: 'var(--theme-text-secondary)' }">
              {{ client.brandKit.fonts.map(f => f.name).join(' / ') }}
            </span>
          </div>
          <p v-if="client.brandKit.industry" class="text-xs mt-1" :style="{ color: 'var(--theme-text-muted)' }">
            Industry: {{ client.brandKit.industry }}
          </p>
        </div>

        <!-- Site Components -->
        <div
          class="p-5 rounded-xl border"
          :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
        >
          <div class="flex items-center gap-2 mb-3">
            <Globe class="w-4 h-4" :style="{ color: 'var(--theme-primary)' }" />
            <h3 class="font-semibold text-sm" :style="{ color: 'var(--theme-text-primary)' }">Site Components</h3>
          </div>
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-xs">
              <PanelTop class="w-3.5 h-3.5" :style="{ color: 'var(--theme-text-muted)' }" />
              <span :style="{ color: headerName ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)' }">
                Header: {{ headerName ?? 'Not selected' }}
              </span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <PanelBottom class="w-3.5 h-3.5" :style="{ color: 'var(--theme-text-muted)' }" />
              <span :style="{ color: footerName ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)' }">
                Footer: {{ footerName ?? 'Not selected' }}
              </span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <LayoutTemplate class="w-3.5 h-3.5" :style="{ color: 'var(--theme-text-muted)' }" />
              <span :style="{ color: templateName ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)' }">
                Template: {{ templateName ?? 'Not selected' }}
              </span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <FileText class="w-3.5 h-3.5" :style="{ color: 'var(--theme-text-muted)' }" />
              <span :style="{ color: pageCount > 0 ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)' }">
                Pages: {{ pageCount > 0 ? `${pageCount} page${pageCount === 1 ? '' : 's'}` : 'None added' }}
              </span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <Blocks class="w-3.5 h-3.5" :style="{ color: 'var(--theme-text-muted)' }" />
              <span :style="{ color: blockCount > 0 ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)' }">
                {{ blockCount > 0 ? `${blockCount} block${blockCount === 1 ? '' : 's'}: ${blockNames.join(', ')}` : 'No blocks selected' }}
              </span>
            </div>
          </div>
        </div>

        <!-- CMS Schemas -->
        <div
          class="p-5 rounded-xl border"
          :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
        >
          <div class="flex items-center gap-2 mb-3">
            <Database class="w-4 h-4" :style="{ color: 'var(--theme-primary)' }" />
            <h3 class="font-semibold text-sm" :style="{ color: 'var(--theme-text-primary)' }">CMS Schemas</h3>
          </div>
          <div class="flex gap-4">
            <div>
              <span class="text-xl font-bold" :style="{ color: 'var(--theme-primary)' }">{{ schemaCount }}</span>
              <span class="text-xs ml-1" :style="{ color: 'var(--theme-text-secondary)' }">document types</span>
            </div>
            <div>
              <span class="text-xl font-bold" :style="{ color: 'var(--theme-primary)' }">{{ fieldCount }}</span>
              <span class="text-xs ml-1" :style="{ color: 'var(--theme-text-secondary)' }">fields</span>
            </div>
          </div>
        </div>

        <!-- Dashboard -->
        <div
          class="p-5 rounded-xl border"
          :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
        >
          <div class="flex items-center gap-2 mb-3">
            <LayoutDashboard class="w-4 h-4" :style="{ color: 'var(--theme-primary)' }" />
            <h3 class="font-semibold text-sm" :style="{ color: 'var(--theme-text-primary)' }">Dashboard</h3>
            <span class="ml-auto text-xs" :style="{ color: 'var(--theme-text-muted)' }">
              {{ enabledWidgetCount }} of 5 widgets
            </span>
          </div>
          <div v-if="enabledWidgetCount > 0" class="space-y-1.5">
            <div v-for="widgetId in dashboardConfig.enabledWidgets" :key="widgetId" class="flex items-center gap-2 text-xs">
              <component :is="WIDGET_ICONS[widgetId]" class="w-3.5 h-3.5 shrink-0" :style="{ color: 'var(--theme-primary)' }" />
              <span :style="{ color: 'var(--theme-text-primary)' }">{{ WIDGET_LABELS[widgetId] }}</span>
              <span class="ml-auto" :style="{ color: 'var(--theme-text-muted)' }">
                <template v-if="widgetId === 'quickActions'">{{ quickActionCount }} action{{ quickActionCount === 1 ? '' : 's' }}</template>
                <template v-else-if="widgetId === 'analytics'">{{ dashboardConfig.analyticsId || 'No ID set' }}</template>
                <template v-else-if="widgetId === 'tutorials'">{{ tutorialCount }} video{{ tutorialCount === 1 ? '' : 's' }}</template>
                <template v-else-if="widgetId === 'links'">{{ linkCount }} link{{ linkCount === 1 ? '' : 's' }}</template>
                <template v-else-if="widgetId === 'contentEditor'">{{ contentEditorCount }} editor{{ contentEditorCount === 1 ? '' : 's' }}</template>
              </span>
            </div>
          </div>
          <p v-else class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">
            No widgets enabled — configure in Dashboard Builder.
          </p>
        </div>
      </div>

      <!-- Build Config Checklist (active mode only) -->
      <div
        v-if="!isExtendMode"
        class="p-6 rounded-xl border mb-8"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <h3 class="font-semibold mb-4" :style="{ color: 'var(--theme-text-primary)' }">Build Config Checklist</h3>
        <div class="space-y-2">
          <div v-for="item in checklist" :key="item.label" class="flex items-center gap-3 py-1">
            <div
              class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              :style="{
                backgroundColor: item.done ? 'var(--theme-primary)' : 'var(--theme-bg-tertiary)',
                color: item.done ? 'var(--theme-text-inverse)' : 'var(--theme-text-muted)'
              }"
            >
              <Check v-if="item.done" class="w-3 h-3" />
            </div>
            <span class="text-sm" :style="{ color: item.done ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)' }">
              {{ item.label }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <!-- ─── DEPLOYMENT CHECKLIST (both modes) ────────────────────────────── -->
    <template v-if="!isPortfolioMode || activeEntry">
      <!-- Section header + overall progress -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-lg font-semibold" :style="{ color: 'var(--theme-text-primary)' }">Deployment Checklist</h2>
          <p class="text-xs mt-0.5" :style="{ color: 'var(--theme-text-muted)' }">
            Track setup and launch steps outside of Build Tools
          </p>
        </div>
        <div class="text-right">
          <span class="text-2xl font-bold tabular-nums" :style="{ color: 'var(--theme-primary)' }">{{ totalChecked }}</span>
          <span class="text-sm" :style="{ color: 'var(--theme-text-muted)' }"> / {{ TOTAL_ITEMS }}</span>
          <div class="text-xs mt-0.5" :style="{ color: 'var(--theme-text-muted)' }">complete</div>
        </div>
      </div>

      <!-- Progress bar -->
      <div
        class="h-2 rounded-full mb-6 overflow-hidden"
        :style="{ backgroundColor: 'var(--theme-bg-tertiary)' }"
      >
        <div
          class="h-full rounded-full transition-all duration-300"
          :style="{
            width: `${Math.round((totalChecked / TOTAL_ITEMS) * 100)}%`,
            backgroundColor: allPhasesComplete ? 'var(--theme-success)' : 'var(--theme-primary)'
          }"
        />
      </div>

      <!-- All phases complete banner -->
      <div
        v-if="allPhasesComplete"
        class="p-4 rounded-xl border mb-6 flex items-center gap-3"
        :style="{ backgroundColor: 'var(--theme-success-light)', borderColor: 'var(--theme-success)' }"
      >
        <Rocket class="w-5 h-5 shrink-0" :style="{ color: 'var(--theme-success)' }" />
        <div>
          <p class="font-semibold text-sm" :style="{ color: 'var(--theme-success)' }">All phases complete!</p>
          <p class="text-xs mt-0.5" :style="{ color: 'var(--theme-success)' }">
            {{ domain }}.com is live and delivered.
          </p>
        </div>
      </div>

      <!-- Phase cards -->
      <div class="space-y-4 mb-8">
        <div
          v-for="(phase, phaseIndex) in PHASES"
          :key="phase.id"
          class="rounded-xl border overflow-hidden"
          :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
        >
          <!-- Phase header -->
          <button
            @click="togglePhase(phase.id)"
            class="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-(--theme-bg-hover) transition-colors"
          >
            <!-- Phase number -->
            <span
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              :style="{
                backgroundColor: phaseChecked(phase) === phase.items.length
                  ? 'var(--theme-success)'
                  : 'var(--theme-bg-tertiary)',
                color: phaseChecked(phase) === phase.items.length
                  ? 'var(--theme-text-inverse)'
                  : 'var(--theme-text-muted)'
              }"
            >
              <Check v-if="phaseChecked(phase) === phase.items.length" class="w-3.5 h-3.5" />
              <span v-else>{{ phaseIndex + 1 }}</span>
            </span>

            <span class="flex-1 font-semibold text-sm" :style="{ color: 'var(--theme-text-primary)' }">
              {{ phase.label }}
            </span>

            <!-- Phase progress -->
            <span class="text-xs tabular-nums shrink-0" :style="{ color: 'var(--theme-text-muted)' }">
              {{ phaseChecked(phase) }}/{{ phase.items.length }}
            </span>

            <!-- Chevron -->
            <component
              :is="collapsedPhases[phase.id] ? ChevronRight : ChevronDown"
              class="w-4 h-4 shrink-0"
              :style="{ color: 'var(--theme-text-muted)' }"
            />
          </button>

          <!-- Phase items -->
          <div v-show="!collapsedPhases[phase.id]" class="border-t" :style="{ borderColor: 'var(--theme-border)' }">
            <div
              v-for="item in phase.items"
              :key="item.id"
              @click="toggleItem(item.id)"
              class="flex items-start gap-3 px-5 py-3 cursor-pointer hover:bg-(--theme-bg-hover) transition-colors border-b last:border-b-0"
              :style="{ borderColor: 'var(--theme-border)' }"
            >
              <!-- Checkbox -->
              <div
                class="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-colors"
                :style="{
                  backgroundColor: checkedItems[item.id] ? 'var(--theme-primary)' : 'transparent',
                  borderColor: checkedItems[item.id] ? 'var(--theme-primary)' : 'var(--theme-border)',
                  color: 'var(--theme-text-inverse)'
                }"
              >
                <Check v-if="checkedItems[item.id]" class="w-3 h-3" />
              </div>
              <!-- Label -->
              <span
                class="text-sm leading-relaxed"
                :style="{
                  color: checkedItems[item.id] ? 'var(--theme-text-muted)' : 'var(--theme-text-primary)',
                  textDecoration: checkedItems[item.id] ? 'line-through' : 'none'
                }"
              >{{ resolveLabel(item.label) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ─── ACTIVE / EXTEND MODE: action buttons ────────────────────────── -->
    <div v-if="!isPortfolioMode" class="flex justify-end gap-3">
      <!-- Extend mode: Complete Extension -->
      <template v-if="isExtendMode">
        <button
          @click="exportDelta"
          class="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
          :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-primary)' }"
          title="Download delta config JSON (new additions only)"
        >
          <Download class="w-4 h-4" />
          Export Delta
        </button>
        <button
          @click="handleCompleteExtension"
          class="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors"
          :style="{ backgroundColor: 'var(--theme-warning)', color: 'var(--theme-text-inverse)' }"
          title="Export delta, update portfolio entry, and exit extend mode"
        >
          <RefreshCw class="w-4 h-4" />
          Complete Extension
        </button>
      </template>

      <!-- Normal mode: Complete Project -->
      <button
        v-else
        :disabled="!allChecksPassed"
        @click="handleComplete"
        class="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-primary)' }"
        :title="!allChecksPassed ? 'Complete all build config checklist items first' : ''"
      >
        <PartyPopper class="w-4 h-4" />
        Complete Project
      </button>
    </div>

  </div>
</template>
