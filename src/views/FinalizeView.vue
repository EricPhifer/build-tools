<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Check, ChevronDown, ChevronRight, Globe, Palette, Type,
  PanelTop, PanelBottom, LayoutTemplate, Blocks, Database,
  LayoutDashboard, PartyPopper, FileText, BarChart3,
  BookOpen, Link2, FileEdit, Download, ArrowLeft, Rocket,
  RefreshCw, PackagePlus
} from 'lucide-vue-next'
import { useWorkflowStore } from '../stores/workflow'
import { useCompositionStore } from '../stores/composition'
import { useRegistryStore } from '../stores/registry'
import { BUSINESS_TYPES } from '../data/siteBuilderData'
import { GROWTH_ONLY_BLOCKS, isScaffolded, isScaffoldedBlock } from '../data/scaffoldedVariants'
import { checkBrandContrast } from '../utils/contrast'
import { buildEnvChecklist, envChecklistMarkdown, envItemId, envItemLabel, type EnvVarItem } from '../utils/envChecklist'
import { defaultReviewCadence } from '../types/dashboard'
import type { DashboardConfig } from '../types/dashboard'
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
    return activeEntry.value.domain.split('.')[0] ?? ''
  }
  return composition.composition.name
    ? composition.composition.name.toLowerCase().replace(/\s+/g, '')
    : client.value?.domain?.split('.')[0] ?? 'project'
})
// The client's real primary domain, whatever its TLD; .com is only a last-resort guess
const primaryDomain = computed(() => {
  if (isPortfolioMode.value && activeEntry.value) return activeEntry.value.domain
  return client.value?.domain || `${domain.value}.com`
})

// Selections the website template can't build (the scaffolder stops on these)
const unbuiltVariants = computed(() =>
  [composition.selectedHeaderVariant, composition.selectedFooterVariant]
    .filter(v => v && !isScaffolded(v.id))
    .map(v => v!.name)
)

// A page's submenu parent as its address (ids are Build Tools' own)
function navParentSlug(page: { navParent?: string }): string | undefined {
  return page.navParent ? composition.siteBuilder.sitemapPages.find(p => p.id === page.navParent)?.slug : undefined
}

// Brand color pairs below WCAG AA, and where the scaffolder adjusts primary for text
const brandContrast = computed(() =>
  checkBrandContrast(client.value?.brandKit?.colors, composition.composition.siteTheme)
)
const contrastFailures = computed(() => brandContrast.value.flatMap(t => t.failures))
const adjustedInks = computed(() => brandContrast.value.filter(t => t.inkAdjusted))
// A dark-only site shows the main logo on dark unless the kit has a dark one
const darkOnlyWithoutDarkLogo = computed(() =>
  composition.composition.siteTheme === 'dark' && !!client.value?.brandKit?.logos?.primary && !client.value?.brandKit?.logos?.dark
)

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
// Chosen blocks with no section type in the template yet (they scaffold as nothing)
const unbuiltBlocks = computed(() =>
  pageBlocks.value
    .filter(id => !isScaffoldedBlock(id, composition.siteBuilder.bundle))
    .map(id => {
      const name = registry.getBlockById(id)?.name ?? id
      return GROWTH_ONLY_BLOCKS.has(id) ? `${name} (Growth only)` : name
    })
)
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
const tutorialCount      = computed(() => dashboardConfig.value.tutorialVideos.filter(v => v.title).length)
const linkCount          = computed(() => dashboardConfig.value.links.filter(l => l.title && l.url).length)
const contentEditorCount = computed(() => dashboardConfig.value.contentEditors.filter(e => e.label).length)

// Resolves the bundle-default review cadence and enforces the minimal (Sustain) profile
function exportedDashboardConfig(): DashboardConfig {
  const dc = dashboardConfig.value
  const minimal = dc.profile === 'minimal'
  // Saved builds may still list the retired Growth widgets (never built)
  const built = new Set(['analytics', 'tutorials', 'links', 'contentEditor', 'contentEditors'])
  return {
    ...dc,
    enabledWidgets: dc.enabledWidgets.filter(w => built.has(w)),
    reports: { reviewCadence: dc.reports?.reviewCadence ?? defaultReviewCadence(composition.siteBuilder.bundle) },
    ...(minimal ? {
      enabledWidgets: dc.enabledWidgets.filter(w => w === 'links'),
      contentKit: { ...dc.contentKit, enabled: false },
      submissionKinds: []
    } : {})
  }
}

const WIDGET_ICONS: Record<string, unknown>  = {
  analytics: BarChart3, tutorials: BookOpen, links: Link2, contentEditor: FileEdit
}
const WIDGET_LABELS: Record<string, string> = {
  analytics: 'Analytics', tutorials: 'Tutorial Videos',
  links: 'Links', contentEditor: 'Content Editors'
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

// ─── Deployment phases ───────────────────────────────────────────────────────
interface ChecklistItem { id: string; label: string }
interface Phase { id: string; label: string; items: ChecklistItem[] }

const BASE_PHASES: Phase[] = [
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
      { id: 'p1-7',  label: 'Run seed script on the new, empty dataset from the studio directory: `pnpm exec sanity exec seed.ts --with-user-token` (it refuses a dataset with content)' },
      { id: 'p1-8',  label: 'Dashboard runs locally (`pnpm dev`, or `netlify dev` to test functions) — all widgets render' },
      { id: 'p1-9',  label: 'All page routes verified in local website' },
      { id: 'p1-10', label: 'Header and footer display correctly' },
      { id: 'p1-11', label: 'Content blocks render correctly on each page' },
      { id: 'p1-12', label: 'Mobile responsiveness tested (Firefox Developer Edition)' },
      { id: 'p1-13', label: 'Sanity content appears in local website' },
      { id: 'p1-14', label: 'Auth0 flow tested locally (if enabled)' },
      { id: 'p1-15', label: 'Auth0: verify VITE_AUTH0_DOMAIN + CLIENT_ID match SPA app (if gated pages)' },
      { id: 'p1-16', label: 'Auth0: log in with test account — non-member redirected to /unauthorized (if gated pages)' },
      { id: 'p1-17', label: 'Auth0: assign role to test account — gated pages now accessible (if gated pages)' },
      { id: 'p1-18', label: '`pnpm build` succeeds — no type errors' },
      { id: 'p1-19', label: 'Lighthouse score checked — no critical issues' },
      { id: 'p1-20', label: 'Billing page loads — subscription card and portal button render' },
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
      { id: 'p2-7', label: 'Website and studio repos may live in the client\'s GitHub org; the dashboard repo stays in the agency org (it\'s the agency\'s tool, not transferred)' },
      { id: 'p2-8', label: 'Git push identity: a per-client `includeIf "gitdir:<client folder>/"` credential file, so pushes use the right account without signing in and out' },
    ]
  },
  {
    id: 'p3',
    label: 'Staging Environment',
    items: [
      { id: 'p3-1', label: 'Netlify site created for website — connected to GitHub repo' },
      { id: 'p3-2', label: 'Netlify site created for dashboard — connected to GitHub repo' },
      { id: 'p3-16', label: 'Each Netlify site linked to the right repo (a studio site linked to the dashboard repo served the dashboard at RMWS)' },
      { id: 'p3-17', label: 'Visitor access protection (password) on for all three sites until launch' },
      { id: 'p3-18', label: 'Pipeline client record: Netlify account/login per site, staging URLs, Sanity project ID, Auth0 tenant. No passwords or keys in notes' },
      { id: 'p3-5', label: 'Website staging deploy succeeds — no build errors' },
      { id: 'p3-6', label: 'Dashboard staging deploy succeeds — no build errors' },
      { id: 'p3-7', label: 'Sanity studio deployed (`pnpm deploy`)' },
      { id: 'p3-8', label: 'Sanity CORS: `pnpm cors` in the studio project, then `pnpm cors https://<site>.netlify.app` plus each staging URL (without them every page change after the first fails)' },
      { id: 'p3-9', label: 'Create build hook in Netlify: Site Settings → Build & Deploy → Build Hooks → Add build hook → Copy URL → paste into Client Dashboard → Managed Services → Netlify → Build Hook URL' },
      { id: 'p3-10', label: 'Smoke test: all three staging URLs load correctly' },
      { id: 'p3-12', label: 'Auth0: add staging callback/logout/web origins to Auth0 SPA app (if gated pages)' },
      { id: 'p3-13', label: 'Auth0: create role (e.g. "Resident") and install Post-Login Action for roles claim (if gated pages)' },
      { id: 'p3-19', label: 'Auth0: dashboard users created with their exact email addresses, and verified' },
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
      { id: 'p4-7',  label: 'Sanity CORS: production domain, www and studio subdomain listed (`pnpm cors` adds any missing); click through several pages on the live site with the console open' },
      { id: 'p4-8',  label: 'Production website deployed — site live at `[clientdomain.com]`' },
      { id: 'p4-9',  label: 'Production dashboard deployed — live at `dashboard.[clientdomain.com]`' },
      { id: 'p4-10', label: 'All production page routes tested' },
      { id: 'p4-11', label: 'Sanity studio accessible at `studio.[clientdomain.com]`' },
      { id: 'p4-12', label: 'Simple Analytics connected and verified — Google Analytics added only if client requested' },
      { id: 'p4-13', label: 'Contact forms and interactive features tested in production' },
      { id: 'p4-14', label: 'Client access credentials and all links delivered' },
      { id: 'p4-15', label: 'Stripe Customer Portal settings reviewed (Settings → Customer Portal in Stripe Dashboard)' },
      { id: 'p4-16', label: 'Billing page tested — portal redirect works, subscription + payment data displays correctly' },
      { id: 'p4-17', label: 'Auth0: add production callback/logout/web origins to Auth0 SPA app (if gated pages)' },
      { id: 'p4-18', label: 'Auth0: seed initial members — assign role to authorized users (if gated pages)' },
      { id: 'p4-19', label: 'Auth0: test login flow on production domain — gated pages accessible to members only (if gated pages)' },
      { id: 'p4-20', label: 'Reports: first speed baseline — `pnpm lighthouse:check --write` in the dashboard project' },
      { id: 'p4-21', label: 'Reports: backfill history — `pnpm reports:generate --last 12 --write`, leaving out a partial first month' },
      { id: 'p4-22', label: 'Reports: `lighthouse-check` and `monthly-report` scheduled functions listed on the production deploy (they never run on staging)' },
      { id: 'p4-23', label: 'Other domains added as Netlify domain aliases; each one 301s to `[clientdomain.com]` (rules are in netlify.toml)' },
      { id: 'p4-24', label: 'SSL checked on any custom subdomain (e.g. a Simple Analytics `sa.` CNAME)' },
      { id: 'p4-25', label: 'Auth0: `https://dashboard.[clientdomain.com]` in the dashboard app\'s callback, logout and web-origin URLs' },
      { id: 'p4-26', label: 'PageSpeed on phone: first paint succeeds, layout shift under 0.1' },
      { id: 'p4-27', label: 'One real contact form message sent: emailed and in the dashboard\'s Submissions inbox. One real support request sent from the dashboard' },
      { id: 'p4-28', label: 'Visitor access protection removed from all three sites' },
      { id: 'p4-29', label: 'Transition in the Pipeline: maintenance start date, rate and dashboard link checked before sending' },
      { id: 'p4-30', label: 'No Content-Security-Policy errors in the browser console on every page of the site and dashboard (a blocked host is added in netlify.toml)' },
      { id: 'p4-31', label: 'Uptime monitor (keyword) on `https://[clientdomain.com]/api/send-message` looking for `"ready":true`' },
      { id: 'p4-32', label: 'Sentry (if used): VITE_SENTRY_DSN set on the site and dashboard; a test error shows up with a readable stack trace' },
    ]
  }
]

// Growth sites are prerendered; Studio "Publish site" batches edits into one build
const GROWTH_PUBLISH_ITEMS: ChecklistItem[] = [
  { id: 'p3-growth-publish-1', label: 'Netlify build hook "Studio publish" on the production branch (and one on staging if used); URLs in the website env' },
  { id: 'p3-growth-publish-2', label: 'Sanity webhook: URL `https://[clientdomain.com]/.netlify/functions/trigger-deploy`, trigger on Create, filter `_type == "sitePublish"`, projection `{_id, target}`, secret = DEPLOY_WEBHOOK_SECRET' },
  { id: 'p3-growth-publish-3', label: 'No other build-on-publish webhook or Netlify–Sanity integration left on (one build per Publish click)' },
  { id: 'p3-growth-publish-4', label: 'Netlify plan build credits raised for this client (1,500–3,000; part of Growth maintenance)' },
  { id: 'p3-growth-publish-5', label: 'Built HTML checked: view-source on a page shows its content; an unknown URL returns a real 404' },
]
const GROWTH_LAUNCH_ITEMS: ChecklistItem[] = [
  { id: 'p4-growth-publish-1', label: 'Studio → Publish site on production: status reaches "Building" and the change shows on the live site' },
]

// Donation block on any page: Stripe on the client's own account
const DONATION_STAGING_ITEMS: ChecklistItem[] = [
  { id: 'p3-donation-1', label: "Client's own Stripe account (their legal name and bank account, never ours); restricted key and webhook set (env checklist)" },
  { id: 'p3-donation-2', label: 'Stripe customer portal turned on, its login link in STRIPE_PORTAL_LOGIN_URL (monthly donors cancel there)' },
  { id: 'p3-donation-3', label: 'Test mode: a one-time and a monthly gift go through; receipt arrives (EIN line correct), client is emailed, gift shows in the dashboard inbox' },
]
const DONATION_LAUNCH_ITEMS: ChecklistItem[] = [
  { id: 'p4-donation-1', label: 'Live Stripe keys and live webhook secret in place of the test ones; a real $5 gift receipted, then refunded' },
]

// Replacing an existing site (RMWS 3.4): migrate on staging, keep its addresses working
const MIGRATION_STAGING_ITEMS: ChecklistItem[] = [
  { id: 'p3-migrate-1', label: 'Old site inventoried: every page address (crawl, its sitemap, Search Console → Pages) and content that was hardcoded in its markup (buttons, taglines, card text, social and compliance links)' },
  { id: 'p3-migrate-2', label: 'Content migrated into the staging dataset only (migration scripts refuse production); run twice to confirm a rerun changes nothing' },
  { id: 'p3-migrate-3', label: 'Images without alt text from the old site listed and given alt text (or marked decorative on purpose)' },
  { id: 'p3-migrate-4', label: 'Every changed address has a redirect in the Sitemap step; each old address checked on staging lands on the right page (301)' },
]
const MIGRATION_LAUNCH_ITEMS: ChecklistItem[] = [
  { id: 'p4-migrate-1', label: 'Staging dataset reviewed, then exported and imported to production (not re-run against production)' },
  { id: 'p4-migrate-2', label: 'After the domain moves: old addresses spot-checked on the live domain, sitemap resubmitted in Search Console, its Pages report watched for 404s for two weeks' },
]

// Environment variables: generated per site from the build config (utils/envChecklist.ts)
const envItems = computed<EnvVarItem[]>(() => {
  if (isPortfolioMode.value) {
    try {
      const saved = JSON.parse(activeEntry.value?.buildConfigJson ?? '{}')
      return saved.envChecklist?.items ?? buildEnvChecklist(saved)
    } catch {
      return []
    }
  }
  return buildEnvChecklist(buildExportConfig())
})

const PHASES = computed<Phase[]>(() => {
  const phases = BASE_PHASES.map(p => ({ ...p, items: [...p.items] }))
  const envPhase: Phase = {
    id: 'p-env',
    label: 'Environment Variables',
    items: [
      { id: 'p-env-account', label: 'Working in the right Netlify account and site for each variable (client sites live under the client\'s login)' },
      ...envItems.value.map(item => ({ id: envItemId(item), label: envItemLabel(item) })),
      { id: 'p-env-redeploy', label: 'Each site redeployed after its variables were set (functions only see env changes after a new deploy)' },
    ]
  }
  const githubIndex = phases.findIndex(p => p.id === 'p2')
  phases.splice(githubIndex + 1, 0, envPhase)
  if (composition.siteBuilder.bundle === 'growth') {
    phases.find(p => p.id === 'p3')?.items.push(...GROWTH_PUBLISH_ITEMS)
    phases.find(p => p.id === 'p4')?.items.push(...GROWTH_LAUNCH_ITEMS)
  }
  const migration = composition.siteBuilder.migration
  if (migration?.existingSiteUrl || migration?.redirects?.length) {
    phases.find(p => p.id === 'p3')?.items.push(...MIGRATION_STAGING_ITEMS)
    phases.find(p => p.id === 'p4')?.items.push(...MIGRATION_LAUNCH_ITEMS)
  }
  if (composition.usesDonations) {
    phases.find(p => p.id === 'p3')?.items.push(...DONATION_STAGING_ITEMS)
    phases.find(p => p.id === 'p4')?.items.push(...DONATION_LAUNCH_ITEMS)
  }
  return phases
})

const TOTAL_ITEMS = computed(() => PHASES.value.reduce((sum, p) => sum + p.items.length, 0))

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

// Count only items on the current list (ids from older checklist versions may linger in saved progress)
const totalChecked      = computed(() => PHASES.value.reduce((sum, p) => sum + phaseChecked(p), 0))
const allPhasesComplete = computed(() => totalChecked.value === TOTAL_ITEMS.value)

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
    .replace(/\[clientdomain\.com\]/g, `${primaryDomain.value}`)
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
      ...(page.isGrowthOnly ? { isGrowthOnly: true } : {}),
      ...(page.isDynamic    ? { isDynamic: true } : {}),
      ...(page.isRepeatable ? { isRepeatable: true } : {}),
      ...(page.authRequired && !page.isLegal ? { authRequired: true } : {}),
      // Submenu parent, by address (headers with submenus; others list it at the top level)
      ...(navParentSlug(page) ? { navParent: navParentSlug(page) } : {}),
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

  // Email for forms, signups and donation receipts, any tier
  if (sb.envConfig.resendApiKey)   env['RESEND_API_KEY']   = sb.envConfig.resendApiKey
  if (sb.envConfig.contactToEmail) env['CONTACT_TO_EMAIL'] = sb.envConfig.contactToEmail

  // Donation section, any tier: the client's own Stripe account
  if (composition.usesDonations) {
    if (sb.envConfig.stripeSecretKey)     env['STRIPE_SECRET_KEY']     = sb.envConfig.stripeSecretKey
    if (sb.envConfig.stripeWebhookSecret) env['STRIPE_WEBHOOK_SECRET'] = sb.envConfig.stripeWebhookSecret
    if (sb.envConfig.donationOrgName)     env['DONATION_ORG_NAME']     = sb.envConfig.donationOrgName
    if (sb.envConfig.donationEin)         env['DONATION_EIN']          = sb.envConfig.donationEin
  }

  // Growth-tier integration env vars (only emitted when bundle === 'growth')
  if (sb.bundle === 'growth') {
    if (sb.envConfig.sanityWriteToken)    env['SANITY_WRITE_TOKEN']     = sb.envConfig.sanityWriteToken
    if (sb.envConfig.tursoDatabaseUrl)    env['TURSO_DATABASE_URL']     = sb.envConfig.tursoDatabaseUrl
    if (sb.envConfig.tursoAuthToken)      env['TURSO_AUTH_TOKEN']       = sb.envConfig.tursoAuthToken
    if (sb.businessType === 'nonprofit') {
      if (sb.envConfig.youtubeApiKey)        env['YOUTUBE_API_KEY']        = sb.envConfig.youtubeApiKey
      if (sb.envConfig.coffeeChatPlaylistId) env['COFFEE_CHAT_PLAYLIST_ID'] = sb.envConfig.coffeeChatPlaylistId
    }
  }

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

  const config = {
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
        main:      `${primaryDomain.value}`,
        studio:    `studio.${primaryDomain.value}`,
        dashboard: `dashboard.${primaryDomain.value}`,
        redirects: c?.redirectDomains ?? []
      },
      isPublic: sb.isPublic, projectMode: sb.projectMode
    },
    env, cssVars,
    site: {
      header: headerVariant ? {
        id: headerVariant.id, componentName: toComponentName(headerVariant.id),
        name: headerVariant.name, description: headerVariant.description,
        authEnabled: composition.composition.headerAuthEnabled,
        darkModeEnabled: composition.composition.siteTheme === 'both',
        schemaRequirements: headerVariant.schemaRequirements ?? [],
        ...(headerVariant.styleNotes ? { styleNotes: headerVariant.styleNotes } : {})
      } : null,
      footer: footerVariant ? {
        id: footerVariant.id, componentName: toComponentName(footerVariant.id),
        name: footerVariant.name, description: footerVariant.description,
        schemaRequirements: footerVariant.schemaRequirements ?? [],
        ...(footerVariant.styleNotes ? { styleNotes: footerVariant.styleNotes } : {})
      } : null,
      // Site-wide color theme: 'light' | 'both' (with a header toggle) | 'dark'.
      // darkModeEnabled is the older switch, kept for scaffolders that predate theme
      theme: composition.composition.siteTheme,
      darkModeEnabled: composition.composition.siteTheme === 'both',
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
    ...((composition.composition.headerAuthEnabled || sb.sitemapPages.some(p => p.authRequired)) ? {
      auth: {
        enabled: true,
        showHeaderLogin: composition.composition.headerAuthEnabled,
        strategy:       sb.envConfig.auth0WhitelistStrategy,
        roleName:       sb.envConfig.auth0RoleName,
        rolesClaim:     sb.envConfig.auth0RolesClaim,
        whitelistClaim: sb.envConfig.auth0WhitelistClaim,
        audience:       sb.envConfig.auth0Audience || undefined,
        loginRoute:     '/login',
        callbackRoute:  '/callback',
        unauthorizedRoute: '/unauthorized'
      }
    } : {}),
    // Replacing an existing site: the scaffolder writes the redirects as 301s
    ...(sb.migration?.existingSiteUrl || sb.migration?.redirects?.length ? {
      migration: {
        existingSiteUrl: sb.migration.existingSiteUrl,
        redirects: sb.migration.redirects.filter(r => r.from.trim() && r.to.trim())
      }
    } : {}),
    dashboard: exportedDashboardConfig(),
    ...(sb.appScreens.length > 0 || sb.dataModel.length > 0
      ? { app: { screens: sb.appScreens, dataModel: sb.dataModel } }
      : {})
  }
  const envItems = buildEnvChecklist(config)
  return { ...config, envChecklist: { items: envItems, markdown: envChecklistMarkdown(envItems) } }
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
  const siteUrl = sb.envConfig.siteUrl || (c?.domain ? `https://${c.domain}` : `https://${primaryDomain.value}`)

  const entry: PortfolioEntry = {
    id:              c?.id ?? `project-${Date.now()}`,
    clientId:        c?.id ?? '',
    clientName:      c?.name ?? composition.composition.name ?? 'Unnamed Client',
    projectName:     composition.composition.name || c?.name || 'Unnamed Project',
    domain:          `${primaryDomain.value}`,
    logoUrl:         c?.brandKit?.logos?.primary ?? c?.brandKit?.logoUrl ?? null,
    siteUrl,
    studioUrl:       `https://studio.${primaryDomain.value}`,
    dashboardUrl:    `https://dashboard.${primaryDomain.value}`,
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
      ...(page.isGrowthOnly ? { isGrowthOnly: true } : {}),
      ...(page.isDynamic    ? { isDynamic: true } : {}),
      ...(page.isRepeatable ? { isRepeatable: true } : {}),
      ...(page.authRequired && !page.isLegal ? { authRequired: true } : {}),
      // Submenu parent, by address (headers with submenus; others list it at the top level)
      ...(navParentSlug(page) ? { navParent: navParentSlug(page) } : {}),
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
      baseProject:   `${primaryDomain.value}`
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
    dashboard: exportedDashboardConfig()
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
            <span class="ml-1 font-normal" :style="{ color: 'var(--theme-text-muted)' }">(used for the export file name; domains come from Client Setup)</span>
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
          >{{ prefix }}{{ primaryDomain }}</span>
        </div>
      </div>

      <div
        v-if="!isExtendMode && unbuiltVariants.length"
        class="mb-6 p-4 rounded-xl border text-sm"
        :style="{ borderColor: 'var(--theme-warning)', color: 'var(--theme-text-primary)', backgroundColor: 'var(--theme-bg-card)' }"
      >
        <strong>{{ unbuiltVariants.join(' and ') }}</strong> {{ unbuiltVariants.length > 1 ? "aren't" : "isn't" }} in the website template yet, so the scaffold will stop.
        Pick a variant marked "In template" in the Site Builder, or build it into pws-foundation-template first.
      </div>

      <div
        v-if="!isExtendMode && darkOnlyWithoutDarkLogo"
        class="mb-6 p-4 rounded-xl border text-sm"
        :style="{ borderColor: 'var(--theme-warning)', color: 'var(--theme-text-primary)', backgroundColor: 'var(--theme-bg-card)' }"
      >
        <strong>Dark-only site, no dark logo:</strong> the main logo will sit on the dark background.
        Add a dark logo to the brand kit (or later in Site Settings) if the main one is dark.
      </div>

      <div
        v-if="unbuiltBlocks.length"
        class="mb-6 p-4 rounded-xl border text-sm"
        :style="{ borderColor: 'var(--theme-warning)', color: 'var(--theme-text-primary)', backgroundColor: 'var(--theme-bg-card)' }"
      >
        <strong>Not built for this site:</strong> {{ unbuiltBlocks.join(', ') }}.
        The site scaffolds without them; editors can use Text Content there. Growth-only blocks need the Growth tier; the others need a section built into pws-foundation-template (and the scaffolder's section list) first.
      </div>

      <div
        v-if="!isExtendMode && (contrastFailures.length || adjustedInks.length)"
        class="mb-6 p-4 rounded-xl border text-sm space-y-2"
        :style="{ borderColor: contrastFailures.length ? 'var(--theme-warning)' : 'var(--theme-border)', color: 'var(--theme-text-primary)', backgroundColor: 'var(--theme-bg-card)' }"
      >
        <template v-if="contrastFailures.length">
          <p><strong>Brand colors below WCAG AA.</strong> Fix these in the brand kit (Client Setup → Resync after changing them) before scaffolding:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li v-for="f in contrastFailures" :key="f.theme + f.label">
              {{ f.theme }}: {{ f.label }} — {{ f.ratio.toFixed(2) }}:1, needs {{ f.need }}:1
              <span class="font-mono text-xs" :style="{ color: 'var(--theme-text-muted)' }">({{ f.fg }} on {{ f.bg }})</span>
            </li>
          </ul>
        </template>
        <p v-for="t in adjustedInks" :key="t.theme" :style="{ color: 'var(--theme-text-secondary)' }">
          {{ t.theme }} theme: primary is too faint as text, so links and accents will use
          <span class="inline-block w-3 h-3 rounded-sm align-middle border" :style="{ backgroundColor: t.primaryInk, borderColor: 'var(--theme-border)' }" />
          <span class="font-mono">{{ t.primaryInk }}</span>. Buttons keep the brand color.
        </p>
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
                <template v-if="widgetId === 'analytics'">{{ dashboardConfig.analyticsId || 'No ID set' }}</template>
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
            {{ primaryDomain }} is live and delivered.
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
