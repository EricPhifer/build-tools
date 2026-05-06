export type DashboardWidgetType = 'analytics' | 'tutorials' | 'links' | 'contentEditor'

export interface TutorialVideo {
  id: string
  title: string
  source?: 'youtube' | 'mux'  // defaults to youtube
  url: string         // YouTube watch URL (unused for Mux)
  muxPlaybackId?: string  // Mux video playback ID
  category: string    // e.g. "CMS", "SEO", "Getting Started"
  description?: string
}

/**
 * Unified link type — replaces the former QuickAction + HelpfulLink split.
 * Without a description, renders as a compact pill; with a description, renders as a card.
 */
export interface DashboardLink {
  id: string
  title: string
  url: string
  description?: string  // when present, renders as a card; when absent, renders as a pill
  emoji?: string        // leading emoji/icon for visual identification
  isBuiltIn?: boolean   // built-in links cannot be deleted by the client
}

/** @deprecated Use DashboardLink instead */
export type HelpfulLink = DashboardLink
/** @deprecated Use DashboardLink instead */
export type QuickAction = DashboardLink

export interface ContentEditorField {
  id: string
  name: string        // Sanity field name
  label: string
  type: 'text' | 'textarea' | 'image' | 'file'
  required: boolean
}

export interface ContentEditorWidget {
  id: string
  label: string         // e.g. "Board Members"
  documentType: string  // Sanity document type
  description?: string
  fields: ContentEditorField[]
}

// ─── Content Kit ─────────────────────────────────────────────────────────────

export type ContentKitSectionId =
  | 'your_business'
  | 'services_products'
  | 'your_story'
  | 'your_customers'
  | 'brand_style'
  | 'practical_details'
  | 'your_goals'

export type BrandPersonality =
  | 'Professional' | 'Friendly' | 'Bold' | 'Minimal' | 'Warm'
  | 'Playful' | 'Luxurious' | 'Rugged' | 'Modern' | 'Classic'
  | 'Approachable' | 'Authoritative'

export const BRAND_PERSONALITY_OPTIONS: BrandPersonality[] = [
  'Professional', 'Friendly', 'Bold', 'Minimal', 'Warm',
  'Playful', 'Luxurious', 'Rugged', 'Modern', 'Classic',
  'Approachable', 'Authoritative'
]

export interface ContentKitSectionConfig {
  id: ContentKitSectionId
  label: string
  description: string
  enabled: boolean
  required: boolean           // required for "complete" status
}

export const DEFAULT_CONTENT_KIT_SECTIONS: ContentKitSectionConfig[] = [
  { id: 'your_business',     label: 'Your Business',      description: 'Business name, tagline, industry, location, years in business', enabled: true,  required: true },
  { id: 'services_products', label: 'Services / Products', description: 'What you offer — repeatable entries with name, description, price range', enabled: true,  required: true },
  { id: 'your_story',        label: 'Your Story',          description: 'Origin story, mission statement, values, team members', enabled: true,  required: false },
  { id: 'your_customers',    label: 'Your Customers',      description: 'Testimonials, client logos, case studies', enabled: true,  required: false },
  { id: 'brand_style',       label: 'Brand & Style',       description: 'Logo upload, brand personality, inspiration photos', enabled: true,  required: true },
  { id: 'practical_details', label: 'Practical Details',    description: 'Phone, email, address, hours, social links', enabled: true,  required: true },
  { id: 'your_goals',        label: 'Your Goals',           description: 'Primary website goal, secondary goals, target audience', enabled: true,  required: true },
]

export interface ContentKitConfig {
  enabled: boolean                          // show Content Kit page in client dashboard
  sections: ContentKitSectionConfig[]       // which sections to show + required status
  maxPersonalityPicks: number               // max brand personality selections (default 4)
  welcomeMessage: string                    // intro text shown at top of the form
  completionEmailNotify: boolean            // email admin when client completes all required sections
}

// ─── Billing ─────────────────────────────────────────────────────────────────

export interface BillingConfig {
  stripeCustomerId: string      // cus_xxx — links deployed dashboard to Stripe customer
  showPendingCharges: boolean   // show pending invoices / ad-hoc charges section
  showOfflineInvoices: boolean  // include offline (Zelle/Check) invoices alongside Stripe
}

export interface DashboardConfig {
  enabledWidgets: DashboardWidgetType[]
  simpleAnalyticsId: string     // Simple Analytics site ID / domain (default analytics provider)
  useGoogleAnalytics: boolean   // Override: use Google Analytics GA4 instead of Simple Analytics
  analyticsId: string           // GA4 Measurement ID (G-XXXXXXXX) — only used when useGoogleAnalytics is true
  analyticsInternalRoutes: string[]  // Dashboard routes filtered from public traffic view
  analyticsConversionPage: string    // Goal page slug for visitor journey funnel (default: '/contact')
  contactWebhookUrl: string     // POST endpoint for client contact form submissions
  auth0Domain: string           // Auth0 tenant domain (e.g. dev-abc.us.auth0.com)
  auth0ClientId: string         // Auth0 Application Client ID for this dashboard
  links: DashboardLink[]        // unified links (pills without description, cards with description)
  tutorialVideos: TutorialVideo[]
  contentEditors: ContentEditorWidget[]
  billing: BillingConfig
  contentKit: ContentKitConfig
}
