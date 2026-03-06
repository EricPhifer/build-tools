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
}
