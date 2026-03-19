export type DashboardWidgetType = 'analytics' | 'tutorials' | 'links' | 'quickActions' | 'contentEditor'

export interface TutorialVideo {
  id: string
  title: string
  source?: 'youtube' | 'mux'  // defaults to youtube
  url: string         // YouTube watch URL (unused for Mux)
  muxPlaybackId?: string  // Mux video playback ID
  category: string    // e.g. "CMS", "SEO", "Getting Started"
  description?: string
}

export interface HelpfulLink {
  id: string
  title: string
  url: string
  description?: string
  emoji?: string
}

export interface QuickAction {
  id: string
  label: string
  url: string
  icon: string        // lucide icon name e.g. 'Globe', 'Zap', 'ExternalLink'
  isBuiltIn?: boolean // built-in actions cannot be deleted
}

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
  analyticsId: string           // GA4 Measurement ID (G-XXXXXXXX)
  netlifyWebhookUrl: string     // Netlify build hook URL for content editor publish
  contactWebhookUrl: string     // POST endpoint for client contact form submissions
  auth0Domain: string           // Auth0 tenant domain (e.g. dev-abc.us.auth0.com)
  auth0ClientId: string         // Auth0 Application Client ID for this dashboard
  quickActions: QuickAction[]
  tutorialVideos: TutorialVideo[]
  helpfulLinks: HelpfulLink[]
  contentEditors: ContentEditorWidget[]
  billing: BillingConfig
  contentKit: ContentKitConfig
}
