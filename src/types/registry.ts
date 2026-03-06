import type { Component } from 'vue'

// === Site Sections ===
export type SiteSection = 'header' | 'footer' | 'main'

// === Schema Manifest Types ===
export interface SchemaField {
  name: string
  type: string           // Sanity type: 'string' | 'image' | 'array' | 'reference' | 'block' | 'object'
  description: string
  required?: boolean
  of?: string            // For arrays: item type (e.g., 'menuItem')
}

export interface SchemaRequirement {
  documentType: string   // Sanity document type: 'siteSettings', 'navigation', 'page', etc.
  title: string          // Display name: 'Site Settings', 'Navigation'
  fields: SchemaField[]
}

// === Format Types ===
export type OutputFormat = 'vue3'

export interface FormatInfo {
  id: OutputFormat
  name: string
  version: string
  description: string
}

// === Component Variant (headers, footers) ===
export interface ComponentVariant {
  id: string
  name: string
  section: SiteSection
  description: string
  component: () => Promise<{ default: Component }>
  tags?: string[]
  defaultProps?: Record<string, unknown>
  schemaRequirements?: SchemaRequirement[]
  formats?: OutputFormat[]
}

export interface SiteSectionConfig {
  section: SiteSection
  label: string
  description: string
  icon: string
  variants: ComponentVariant[]
}

// === Page Template Types ===
export type TemplateSlot = 'header' | 'content' | 'sidebar' | 'featured' | 'right' | 'col2' | 'col3' | 'secondary'

export interface PageTemplate {
  id: string
  name: string
  description: string
  component: () => Promise<{ default: Component }>
  layout: TemplateSlot[]
  tags?: string[]
  defaultBlocks?: Partial<Record<TemplateSlot, string[]>>
  requiredBlocks?: Partial<Record<TemplateSlot, string[]>>
  schemaRequirements?: SchemaRequirement[]
}

// === Content Block Types ===
export type BlockCategory = 'hero' | 'content' | 'features' | 'cta' | 'gallery' | 'testimonial'

export interface ContentBlock {
  id: string
  name: string
  description: string
  component: () => Promise<{ default: Component }>
  category: BlockCategory
  tags?: string[]
  fullWidthOnly?: boolean
  defaultProps?: Record<string, unknown>
  schemaRequirements?: SchemaRequirement[]
}

// === Composition Types ===
export interface PageConfig {
  id: string
  name: string
  slug: string
  templateOverride: string | null
  blocks: string[]
}

export interface ProjectComposition {
  name: string
  formatId: OutputFormat
  header: string | null
  headerAuthEnabled: boolean
  headerDarkModeEnabled: boolean
  footer: string | null
  defaultTemplate: string | null
  selectedBlocks: string[]
  pages: PageConfig[]
  createdAt: string
  updatedAt: string
}

// === Client / Brand Kit Types ===

/** Full theme color set — mirrors Client Dashboard's BrandKitColors */
export interface BrandThemeColors {
  primary?: string
  primaryHover?: string
  primaryLight?: string
  secondary?: string
  secondaryHover?: string
  accent?: string
  accentHover?: string
  bgPrimary?: string
  bgSecondary?: string
  bgTertiary?: string
  bgCard?: string
  bgHover?: string
  textPrimary?: string
  textSecondary?: string
  textMuted?: string
  textInverse?: string
  border?: string
  borderLight?: string
  success?: string
  successLight?: string
  warning?: string
  warningLight?: string
  danger?: string
  dangerLight?: string
  sidebarBg?: string
  sidebarText?: string
  sidebarHover?: string
  sidebarActive?: string
}

export interface BrandColors {
  // Core required fields (backward compat)
  primary: string
  secondary: string
  accent: string
  neutral: string     // legacy — background is the preferred field for new code
  // Extended light theme tokens
  primaryHover?: string
  primaryLight?: string
  secondaryHover?: string
  accentHover?: string
  background?: string
  surface?: string
  text?: string
  textSecondary?: string
  border?: string
  // Core dark variants
  primaryDark?: string
  secondaryDark?: string
  accentDark?: string
  neutralDark?: string  // legacy — backgroundDark is preferred for new code
  // Extended dark theme tokens
  backgroundDark?: string
  surfaceDark?: string
  textDark?: string
  textSecondaryDark?: string
  borderDark?: string
  // Full 28-key theme sets from Client Dashboard (when available)
  light?: BrandThemeColors
  dark?: BrandThemeColors
}

export interface BrandFont {
  name: string
  category: 'heading' | 'body'
  url?: string
  importUrl?: string  // Full Google Fonts import URL (from API)
  weight?: string     // legacy single weight string
  weights?: number[]  // multi-select weights array
  style?: 'normal' | 'italic'
}

export interface BrandKit {
  colors: BrandColors
  fonts: BrandFont[]
  logoUrl: string | null       // legacy — use logos.primary for new code
  logos?: {
    primary?: string
    dark?: string
    favicon?: string
  }
  borderRadius?: string
  guidelines?: {
    voice?: string
    usage?: string
    notes?: string
  }
  whatTheyOffer: string
  industry: string
}

export interface ConnectedWebsite {
  id: string
  url: string    // stored without protocol, e.g. "acme.com"
  label: string  // "Main Website" | "Facebook" | "Instagram" | "LinkedIn" | "Twitter/X" | etc.
}

export interface ManagedService {
  id?: string
  type: string         // "domain" | "hosting" | "CDN" | "database" | "email" | "DNS" | "SSL" | "storage" | "analytics" | "other"
  provider: string
  plan?: string
  status?: string      // "active" | "expiring_soon" | "expired" | "cancelled"
  renewalDate?: string
  managementUrl?: string
}

export interface HealthCheckAreaScore {
  score: number
  evidence?: Record<string, unknown>  // raw evidence for use in later workflow steps
}

export interface ClientHealthCheck {
  score: number
  date?: string
  searchVisibility?: HealthCheckAreaScore
  googleBusiness?: HealthCheckAreaScore
  socialPresence?: HealthCheckAreaScore
  websiteDiscovery?: HealthCheckAreaScore
  brandConsistency?: HealthCheckAreaScore
  contactAccessibility?: HealthCheckAreaScore
  trustCompliance?: HealthCheckAreaScore
}

export interface ClientInfo {
  id: string
  name: string
  contactEmail: string
  domain: string
  brandKit: BrandKit
  idealCustomer: string
  createdAt: string
  updatedAt: string
  // Imported read-only data from Client Dashboard
  connectedWebsites?: ConnectedWebsite[]
  managedServices?: ManagedService[]
  healthCheck?: ClientHealthCheck
}

// === Business Type ===
export type BusinessType =
  | 'local_service'
  | 'consultant'
  | 'nonprofit'
  | 'church'
  | 'hoa'
  | 'retail'
  | 'creative'
  | 'technology'
  // Project Mode types (internal / personal project categories)
  | 'project_it'
  | 'project_web'
  | 'project_dashboard'
  | 'project_compilation'
  | 'project_meal_plan'

export interface BusinessTypeInfo {
  id: BusinessType
  label: string
  schemaType: string
  description: string
  icon: string
}

// === Sitemap ===
export type NavAssignment = 'primary' | 'footer' | 'none' | 'both'

export interface SitemapPage {
  id: string
  name: string
  slug: string
  nav: NavAssignment
  isCore: boolean
  isLegal: boolean
  isEnrichOnly: boolean
  notes?: string
  template?: string | null
  blocks?: string[]
  slotBlocks?: Partial<Record<string, string[]>>
  metaDescription?: string
}

// === App Build Types ===
export type AppViewType = 'list' | 'detail' | 'form' | 'dashboard' | 'settings' | 'auth' | 'other'

export interface AppScreen {
  id: string
  name: string
  route: string
  viewType: AppViewType
  description?: string
  isEnrichOnly?: boolean
  notes?: string
}

export type DataFieldType = 'string' | 'number' | 'boolean' | 'date' | 'image' | 'array' | 'reference' | 'richtext'

export interface DataField {
  id: string
  name: string
  type: DataFieldType
  description?: string
  required?: boolean
}

export interface DataEntity {
  id: string
  name: string
  description?: string
  fields: DataField[]
}

// App project types — use the app build path (Screens + Data Model) instead of website path
export const APP_PROJECT_TYPES: BusinessType[] = ['project_dashboard', 'project_compilation', 'project_meal_plan']

export function isAppProjectType(type: BusinessType | null): boolean {
  return type !== null && (APP_PROJECT_TYPES as string[]).includes(type)
}

// === Legal Pages ===
export interface LegalPageContent {
  privacyPolicy: string
  termsConditions: string
  accessibilityStatement: string
  cookiePolicy: string
}

// === Build Checklist ===
export type ChecklistItemStatus = 'not_started' | 'in_progress' | 'complete'

export interface ChecklistItem {
  id: string
  label: string
  status: ChecklistItemStatus
  notes?: string
  actionLabel?: string
  actionUrl?: string
}

export type ChecklistCategory =
  | 'searchVisibility'
  | 'googleBusiness'
  | 'socialPresence'
  | 'speedSecurity'
  | 'brandConsistency'
  | 'contactAccessibility'
  | 'trustCompliance'

// === Bundle ===
export type BundleType = 'foundation' | 'enrich' | 'growth'

// === Project Mode ===
export type ProjectType = 'personal_website' | 'dashboard' | 'database_catalog' | 'custom_tool' | 'other'
export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'complete'

export interface ProjectLink {
  id: string
  label: string
  url: string
}

export interface Project {
  id: string
  name: string
  type: ProjectType
  description: string
  status: ProjectStatus
  links: ProjectLink[]
  notes: string
  createdAt: string
  updatedAt: string
}

// === Workflow Types ===
export type WorkflowStep = 'client' | 'site' | 'cms' | 'dashboard' | 'finalize'

export type StepStatus = 'locked' | 'available' | 'in-progress' | 'complete'

// === Portfolio Types ===
export type PortfolioStatus = 'building' | 'active' | 'maintenance'

export interface PortfolioEntry {
  id: string
  clientId: string
  clientName: string
  projectName: string
  domain: string
  logoUrl: string | null
  siteUrl: string
  studioUrl: string
  dashboardUrl: string
  businessType: string | null
  status: PortfolioStatus
  completedAt: string
  buildConfigJson?: string  // full JSON export stored at completion time
  finalizeProgress?: Record<string, boolean>
}
