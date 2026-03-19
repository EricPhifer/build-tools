import { inject } from 'vue'

export const SITE_CONTEXT_KEY = 'siteContext'

export interface SiteContext {
  siteName: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  headingFont: string
  bodyFont: string
  industry: string
  whatTheyOffer: string
  contactEmail: string
  domain: string
}

export const defaultSiteContext: SiteContext = {
  siteName: 'Your Business',
  primaryColor: '#4f46e5',
  secondaryColor: '#7c3aed',
  accentColor: '#0ea5e9',
  headingFont: 'serif',
  bodyFont: 'sans-serif',
  industry: 'professional services',
  whatTheyOffer: 'expert solutions tailored to your business needs',
  contactEmail: 'hello@yourbusiness.com',
  domain: 'yourbusiness.com'
}

export function useSiteContext(): SiteContext {
  return inject<SiteContext>(SITE_CONTEXT_KEY) ?? defaultSiteContext
}

/** Returns a hex color as an rgba() string at the given opacity (0–1). */
export function colorWithOpacity(hex: string, opacity: number): string {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  if (!m) return `rgba(79,70,229,${opacity})`
  return `rgba(${parseInt(m[1]!, 16)},${parseInt(m[2]!, 16)},${parseInt(m[3]!, 16)},${opacity})`
}
