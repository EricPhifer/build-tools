import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRegistryStore } from './registry'
import type {
  ProjectComposition, PageConfig, SchemaRequirement, SchemaField,
  BusinessType, SitemapPage, LegalPageContent, ChecklistItem, ChecklistCategory, BundleType,
  AppScreen, DataEntity
} from '../types/registry'
import type { DashboardConfig } from '../types/dashboard'
import { DEFAULT_CONTENT_KIT_SECTIONS } from '../types/dashboard'

const STORAGE_KEY = 'build-tools-composition'

export interface EnvConfig {
  sanityProjectId: string
  sanityDataset: string
  siteUrl: string
  auth0Domain: string
  auth0ClientId: string
}

export interface SiteBuilderData {
  bundle: BundleType | null
  businessType: BusinessType | null
  sitemapPages: SitemapPage[]
  legalContent: Partial<LegalPageContent>
  checklist: Partial<Record<ChecklistCategory, ChecklistItem[]>>
  projectMode: boolean
  // App build path
  appScreens: AppScreen[]
  dataModel: DataEntity[]
  isPublic: boolean
  envConfig: EnvConfig
  // Persisted checklist confirmations (survive navigation)
  checklistConfirmedWebsite: Record<string, boolean>
  checklistConfirmedApp: Record<string, boolean>
  // Dashboard builder configuration
  dashboardConfig: DashboardConfig
}

function createDefaultEnvConfig(): EnvConfig {
  return {
    sanityProjectId: '',
    sanityDataset: 'production',
    siteUrl: '',
    auth0Domain: '',
    auth0ClientId: ''
  }
}

function createDefaultDashboardConfig(): DashboardConfig {
  return {
    enabledWidgets: ['quickActions', 'analytics', 'tutorials', 'links'],
    simpleAnalyticsId: '',
    useGoogleAnalytics: false,
    analyticsId: '',
    contactWebhookUrl: '',
    auth0Domain: '',
    auth0ClientId: '',
    quickActions: [],
    tutorialVideos: [],
    helpfulLinks: [],
    contentEditors: [],
    billing: {
      stripeCustomerId: '',
      showPendingCharges: true,
      showOfflineInvoices: true
    },
    contentKit: {
      enabled: true,
      sections: DEFAULT_CONTENT_KIT_SECTIONS.map(s => ({ ...s })),
      maxPersonalityPicks: 4,
      welcomeMessage: '',
      completionEmailNotify: true
    }
  }
}

function createDefaultSiteBuilder(): SiteBuilderData {
  return {
    bundle: null,
    businessType: null,
    sitemapPages: [],
    legalContent: {},
    checklist: {},
    projectMode: false,
    appScreens: [],
    dataModel: [],
    isPublic: false,
    envConfig: createDefaultEnvConfig(),
    checklistConfirmedWebsite: {},
    checklistConfirmedApp: {},
    dashboardConfig: createDefaultDashboardConfig()
  }
}

function createDefaultComposition(): ProjectComposition {
  return {
    name: '',
    formatId: 'vue3',
    header: null,
    headerAuthEnabled: false,
    headerDarkModeEnabled: false,
    footer: null,
    defaultTemplate: null,
    selectedBlocks: [],
    pages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

const SITE_BUILDER_KEY = 'build-tools-site-builder'

function loadFromStorage(): ProjectComposition {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...createDefaultComposition(), ...parsed }
    }
  } catch {
    // Ignore parse errors
  }
  return createDefaultComposition()
}

function loadSiteBuilderFromStorage(): SiteBuilderData {
  try {
    const stored = localStorage.getItem(SITE_BUILDER_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      const defaults = createDefaultSiteBuilder()
      const sitemapPages = (parsed.sitemapPages ?? []).map((p: SitemapPage) =>
        p.isLegal && !p.blocks?.length ? { ...p, blocks: ['block-text'] } : p
      )
      return {
        ...defaults,
        ...parsed,
        sitemapPages,
        envConfig: { ...defaults.envConfig, ...(parsed.envConfig ?? {}) },
        checklistConfirmedWebsite: { ...(parsed.checklistConfirmedWebsite ?? {}) },
        checklistConfirmedApp: { ...(parsed.checklistConfirmedApp ?? {}) },
        dashboardConfig: { ...createDefaultDashboardConfig(), ...(parsed.dashboardConfig ?? {}) }
      }
    }
  } catch {
    // Ignore parse errors
  }
  return createDefaultSiteBuilder()
}

export const useCompositionStore = defineStore('composition', () => {
  const composition = ref<ProjectComposition>(loadFromStorage())
  const siteBuilder = ref<SiteBuilderData>(loadSiteBuilderFromStorage())

  // Persist on every change
  function save() {
    composition.value.updatedAt = new Date().toISOString()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(composition.value))
  }

  function saveSiteBuilder() {
    localStorage.setItem(SITE_BUILDER_KEY, JSON.stringify(siteBuilder.value))
  }

  // === Resolved variant objects ===
  const selectedHeaderVariant = computed(() => {
    if (!composition.value.header) return null
    const registry = useRegistryStore()
    return registry.getVariantById(composition.value.header) ?? null
  })

  const selectedFooterVariant = computed(() => {
    if (!composition.value.footer) return null
    const registry = useRegistryStore()
    return registry.getVariantById(composition.value.footer) ?? null
  })

  const selectedTemplate = computed(() => {
    if (!composition.value.defaultTemplate) return null
    const registry = useRegistryStore()
    return registry.getTemplateById(composition.value.defaultTemplate) ?? null
  })

  // === Schema merging ===
  const mergedSchemaRequirements = computed(() => {
    const registry = useRegistryStore()
    const allRequirements: SchemaRequirement[] = []

    // Collect from header
    if (selectedHeaderVariant.value?.schemaRequirements) {
      allRequirements.push(...selectedHeaderVariant.value.schemaRequirements)
    }

    // Collect from footer
    if (selectedFooterVariant.value?.schemaRequirements) {
      allRequirements.push(...selectedFooterVariant.value.schemaRequirements)
    }

    // Collect from default template
    if (selectedTemplate.value?.schemaRequirements) {
      allRequirements.push(...selectedTemplate.value.schemaRequirements)
    }

    // Collect from selected blocks (project-level block pool)
    for (const blockId of composition.value.selectedBlocks) {
      const block = registry.getBlockById(blockId)
      if (block?.schemaRequirements) {
        allRequirements.push(...block.schemaRequirements)
      }
    }

    // Collect from page-assigned blocks (content slot + all named slots)
    for (const page of siteBuilder.value.sitemapPages) {
      const allPageBlockIds = [
        ...(page.blocks ?? []),
        ...Object.values(page.slotBlocks ?? {}).flatMap(v => v ?? [])
      ]
      for (const blockId of [...new Set(allPageBlockIds)]) {
        const block = registry.getBlockById(blockId)
        if (block?.schemaRequirements) {
          allRequirements.push(...block.schemaRequirements)
        }
      }
    }

    // Merge by documentType, deduplicate fields by name
    const merged = new Map<string, SchemaRequirement>()
    for (const req of allRequirements) {
      const existing = merged.get(req.documentType)
      if (existing) {
        // Merge fields, deduplicate by name
        for (const field of req.fields) {
          if (!existing.fields.some((f: SchemaField) => f.name === field.name)) {
            existing.fields.push(field)
          }
        }
      } else {
        merged.set(req.documentType, {
          documentType: req.documentType,
          title: req.title,
          fields: [...req.fields]
        })
      }
    }

    return Array.from(merged.values())
  })

  const isComplete = computed(() => {
    return !!(
      composition.value.header &&
      composition.value.footer &&
      siteBuilder.value.sitemapPages.length > 0
    )
  })

  // === Actions ===
  function setProjectName(name: string) {
    composition.value.name = name
    save()
  }

  function setHeader(id: string | null) {
    composition.value.header = id
    save()
  }

  function setHeaderAuthEnabled(value: boolean) {
    composition.value.headerAuthEnabled = value
    save()
  }

  function setHeaderDarkModeEnabled(value: boolean) {
    composition.value.headerDarkModeEnabled = value
    save()
  }

  function setFooter(id: string | null) {
    composition.value.footer = id
    save()
  }

  function setDefaultTemplate(id: string | null) {
    composition.value.defaultTemplate = id
    save()
  }

  function toggleBlock(id: string) {
    const idx = composition.value.selectedBlocks.indexOf(id)
    if (idx >= 0) {
      composition.value.selectedBlocks.splice(idx, 1)
    } else {
      composition.value.selectedBlocks.push(id)
    }
    save()
  }

  function isBlockSelected(id: string): boolean {
    return composition.value.selectedBlocks.includes(id)
  }

  function addPage(page: Omit<PageConfig, 'id'>) {
    composition.value.pages.push({
      ...page,
      id: crypto.randomUUID()
    })
    save()
  }

  function removePage(id: string) {
    composition.value.pages = composition.value.pages.filter(p => p.id !== id)
    save()
  }

  function updatePage(id: string, partial: Partial<Omit<PageConfig, 'id'>>) {
    const page = composition.value.pages.find(p => p.id === id)
    if (page) {
      Object.assign(page, partial)
      save()
    }
  }

  function addBlockToPage(pageId: string, blockId: string) {
    const page = composition.value.pages.find(p => p.id === pageId)
    if (page) {
      page.blocks.push(blockId)
      save()
    }
  }

  function removeBlockFromPage(pageId: string, blockIndex: number) {
    const page = composition.value.pages.find(p => p.id === pageId)
    if (page && blockIndex >= 0 && blockIndex < page.blocks.length) {
      page.blocks.splice(blockIndex, 1)
      save()
    }
  }

  function reorderBlocks(pageId: string, fromIndex: number, toIndex: number) {
    const page = composition.value.pages.find(p => p.id === pageId)
    if (page && fromIndex >= 0 && fromIndex < page.blocks.length && toIndex >= 0 && toIndex < page.blocks.length) {
      const removed = page.blocks.splice(fromIndex, 1)
      page.blocks.splice(toIndex, 0, removed[0]!)
      save()
    }
  }

  // === Site Builder Actions ===
  function setProjectMode(enabled: boolean) {
    siteBuilder.value.projectMode = enabled
    saveSiteBuilder()
  }

  function setBundle(bundle: BundleType | null) {
    siteBuilder.value.bundle = bundle
    saveSiteBuilder()
  }

  function setBusinessType(type: BusinessType | null) {
    siteBuilder.value.businessType = type
    saveSiteBuilder()
  }

  function setSitemapPages(pages: SitemapPage[]) {
    siteBuilder.value.sitemapPages = pages
    saveSiteBuilder()
  }

  function updateSitemapPage(id: string, partial: Partial<SitemapPage>) {
    const page = siteBuilder.value.sitemapPages.find(p => p.id === id)
    if (page) {
      Object.assign(page, partial)
      saveSiteBuilder()
    }
  }

  function addSitemapPage(page: SitemapPage) {
    siteBuilder.value.sitemapPages.push(page)
    saveSiteBuilder()
  }

  function removeSitemapPage(id: string) {
    siteBuilder.value.sitemapPages = siteBuilder.value.sitemapPages.filter(p => p.id !== id)
    saveSiteBuilder()
  }

  function setLegalContent(partial: Partial<LegalPageContent>) {
    siteBuilder.value.legalContent = { ...siteBuilder.value.legalContent, ...partial }
    saveSiteBuilder()
  }

  function setChecklist(category: ChecklistCategory, items: ChecklistItem[]) {
    siteBuilder.value.checklist[category] = items
    saveSiteBuilder()
  }

  function updateChecklistItem(category: ChecklistCategory, itemId: string, partial: Partial<ChecklistItem>) {
    const items = siteBuilder.value.checklist[category]
    if (items) {
      const item = items.find(i => i.id === itemId)
      if (item) {
        Object.assign(item, partial)
        saveSiteBuilder()
      }
    }
  }

  // === App Build Actions ===
  function setAppScreens(screens: AppScreen[]) {
    siteBuilder.value.appScreens = screens
    saveSiteBuilder()
  }

  function updateAppScreen(id: string, partial: Partial<AppScreen>) {
    const screen = siteBuilder.value.appScreens.find(s => s.id === id)
    if (screen) {
      Object.assign(screen, partial)
      saveSiteBuilder()
    }
  }

  function setDataModel(entities: DataEntity[]) {
    siteBuilder.value.dataModel = entities
    saveSiteBuilder()
  }

  function setIsPublic(value: boolean) {
    siteBuilder.value.isPublic = value
    saveSiteBuilder()
  }

  function setEnvConfig(partial: Partial<EnvConfig>) {
    siteBuilder.value.envConfig = { ...createDefaultEnvConfig(), ...siteBuilder.value.envConfig, ...partial }
    saveSiteBuilder()
  }

  function setDashboardConfig(partial: Partial<DashboardConfig>) {
    siteBuilder.value.dashboardConfig = {
      ...createDefaultDashboardConfig(),
      ...siteBuilder.value.dashboardConfig,
      ...partial
    }
    saveSiteBuilder()
  }

  // === Extend / Re-open: restore full state from a parsed build config ===
  // Returns the IDs of restored pages (used as the extend mode snapshot).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function loadFromBuildConfig(config: any): string[] {
    // --- Composition (header/footer/template) ---
    composition.value.header          = config.site?.header?.id ?? null
    composition.value.footer          = config.site?.footer?.id ?? null
    composition.value.defaultTemplate = config.site?.defaultTemplate?.id ?? null
    composition.value.headerAuthEnabled     = config.site?.header?.authEnabled ?? false
    composition.value.headerDarkModeEnabled = config.site?.header?.darkModeEnabled ?? false
    composition.value.name = config.project?.name ?? config.client?.name ?? ''
    save()

    // --- SitemapPages: convert slots back to blocks / slotBlocks arrays ---
    const pages: SitemapPage[] = (config.site?.pages ?? []).map((p: any) => {
      const slotBlocks: Record<string, string[]> = {}
      for (const [slot, arr] of Object.entries(p.slots ?? {})) {
        if (slot !== 'content') {
          slotBlocks[slot] = (arr as any[]).map((b: any) => b.id)
        }
      }
      return {
        id:           p.id,
        name:         p.name,
        slug:         p.slug,
        nav:          p.nav ?? 'none',
        isCore:       p.isCore ?? false,
        isLegal:      p.isLegal ?? false,
        isEnrichOnly: p.isEnrichOnly ?? false,
        notes:        p.notes ?? undefined,
        metaDescription: p.metaDescription ?? undefined,
        template:     p.template?.id ?? undefined,
        blocks:       ((p.slots?.content ?? []) as any[]).map((b: any) => b.id),
        slotBlocks:   Object.keys(slotBlocks).length ? slotBlocks : undefined
      } as SitemapPage
    })

    // --- Other siteBuilder fields ---
    siteBuilder.value.bundle        = config.project?.bundle ?? null
    siteBuilder.value.businessType  = config.project?.businessType ?? null
    siteBuilder.value.isPublic      = config.project?.isPublic ?? false
    siteBuilder.value.projectMode   = config.project?.projectMode ?? false
    siteBuilder.value.sitemapPages  = pages

    siteBuilder.value.dashboardConfig = {
      ...createDefaultDashboardConfig(),
      ...(config.dashboard ?? {})
    }

    const env = config.env ?? {}
    siteBuilder.value.envConfig = {
      sanityProjectId: env['VITE_SANITY_PROJECT_ID'] ?? '',
      sanityDataset:   env['VITE_SANITY_DATASET']    ?? 'production',
      siteUrl:         env['VITE_SITE_URL']           ?? '',
      auth0Domain:     env['VITE_AUTH0_DOMAIN']       ?? '',
      auth0ClientId:   env['VITE_AUTH0_CLIENT_ID']    ?? ''
    }

    if (config.legal) {
      siteBuilder.value.legalContent = {
        privacyPolicy:          config.legal.privacyPolicy          ?? '',
        termsAndConditions:     config.legal.termsAndConditions ?? config.legal.termsConditions ?? '',
        accessibilityStatement: config.legal.accessibilityStatement ?? '',
        cookiePolicy:           config.legal.cookiePolicy           ?? ''
      }
    }

    saveSiteBuilder()
    return pages.map(p => p.id)
  }

  function toggleChecklistConfirmed(mode: 'website' | 'app', key: string) {
    const target = mode === 'website'
      ? siteBuilder.value.checklistConfirmedWebsite
      : siteBuilder.value.checklistConfirmedApp
    target[key] = !target[key]
    saveSiteBuilder()
  }

  function reset() {
    composition.value = createDefaultComposition()
    siteBuilder.value = createDefaultSiteBuilder()
    save()
    saveSiteBuilder()
  }

  return {
    composition,
    siteBuilder,
    selectedHeaderVariant,
    selectedFooterVariant,
    selectedTemplate,
    mergedSchemaRequirements,
    isComplete,
    setProjectName,
    setHeader,
    setHeaderAuthEnabled,
    setHeaderDarkModeEnabled,
    setFooter,
    setDefaultTemplate,
    toggleBlock,
    isBlockSelected,
    addPage,
    removePage,
    updatePage,
    addBlockToPage,
    removeBlockFromPage,
    reorderBlocks,
    setProjectMode,
    setBundle,
    setBusinessType,
    setSitemapPages,
    updateSitemapPage,
    addSitemapPage,
    removeSitemapPage,
    setLegalContent,
    setChecklist,
    updateChecklistItem,
    setAppScreens,
    updateAppScreen,
    setDataModel,
    setIsPublic,
    setEnvConfig,
    setDashboardConfig,
    loadFromBuildConfig,
    toggleChecklistConfirmed,
    reset
  }
})
