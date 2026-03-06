<script setup lang="ts">
import { shallowRef, onMounted, provide, type Component } from 'vue'
import { useRoute } from 'vue-router'
import { useRegistryStore } from '../stores/registry'
import { useCompositionStore } from '../stores/composition'
import { SITE_CONTEXT_KEY, type SiteContext } from '../composables/useSiteContext'

const route = useRoute()
const registry = useRegistryStore()
const composition = useCompositionStore()

// ── Parse query params ────────────────────────────────────────────────────────
const headerId      = (route.query.headerId as string) || ''
const footerId      = (route.query.footerId as string) || ''
const templateId    = (route.query.templateId as string) || ''

const pageId        = (route.query.pageId as string) || ''

// Content slot (primary blocks)
const blockIds      = ((route.query.blockIds as string) || '').split(',').filter(Boolean)

// Per-slot block IDs
const headerBlockIds    = ((route.query.headerBlockIds    as string) || '').split(',').filter(Boolean)
const sidebarBlockIds   = ((route.query.sidebarBlockIds   as string) || '').split(',').filter(Boolean)
const featuredBlockIds  = ((route.query.featuredBlockIds  as string) || '').split(',').filter(Boolean)
const rightBlockIds     = ((route.query.rightBlockIds     as string) || '').split(',').filter(Boolean)
const col2BlockIds      = ((route.query.col2BlockIds      as string) || '').split(',').filter(Boolean)
const col3BlockIds      = ((route.query.col3BlockIds      as string) || '').split(',').filter(Boolean)
const secondaryBlockIds = ((route.query.secondaryBlockIds as string) || '').split(',').filter(Boolean)

const siteName       = (route.query.siteName as string) || 'Your Business'
const navLinks       = ((route.query.navLinks as string) || '').split(',').filter(Boolean)
const footerNavLinks = ((route.query.footerNavLinks as string) || '').split(',').filter(Boolean)
const socialLinks    = ((route.query.socialLinks as string) || '').split(',').filter(Boolean)
const copyrightText  = (route.query.copyrightText as string) || `${new Date().getFullYear()} Your Business. All rights reserved.`
const authEnabled    = route.query.authEnabled === 'true'
const darkModeEnabled = route.query.darkModeEnabled === 'true'

// ── Brand / site context ──────────────────────────────────────────────────────
const headingFont = (route.query.headingFont as string) || 'serif'
const bodyFont    = (route.query.bodyFont    as string) || 'sans-serif'
const borderRadius = (route.query.borderRadius as string) || ''
const colorsLight = (() => {
  try { return JSON.parse((route.query.colorsLight as string) || '{}') } catch { return {} }
})()

const KEY_TO_VAR: Record<string, string> = {
  primary: '--theme-primary', primaryHover: '--theme-primary-hover', primaryLight: '--theme-primary-light',
  secondary: '--theme-secondary', secondaryHover: '--theme-secondary-hover',
  accent: '--theme-accent', accentHover: '--theme-accent-hover',
  bgPrimary: '--theme-bg-primary', bgSecondary: '--theme-bg-secondary',
  bgTertiary: '--theme-bg-tertiary', bgCard: '--theme-bg-card', bgHover: '--theme-bg-hover',
  textPrimary: '--theme-text-primary', textSecondary: '--theme-text-secondary',
  textMuted: '--theme-text-muted', textInverse: '--theme-text-inverse',
  border: '--theme-border', borderLight: '--theme-border-light',
  success: '--theme-success', successLight: '--theme-success-light',
  warning: '--theme-warning', warningLight: '--theme-warning-light',
  danger: '--theme-danger', dangerLight: '--theme-danger-light',
  sidebarBg: '--theme-sidebar-bg', sidebarText: '--theme-sidebar-text',
  sidebarHover: '--theme-sidebar-hover', sidebarActive: '--theme-sidebar-active'
}

function applyBrandColors(colors: Record<string, string>) {
  const root = document.documentElement
  for (const [key, varName] of Object.entries(KEY_TO_VAR)) {
    if (colors[key]) root.style.setProperty(varName, colors[key])
  }
}

const siteContext: SiteContext = {
  siteName,
  primaryColor:  (route.query.primaryColor  as string) || '#4f46e5',
  secondaryColor:(route.query.secondaryColor as string) || '#7c3aed',
  accentColor:   (route.query.accentColor   as string) || '#0ea5e9',
  headingFont,
  bodyFont,
  industry:      (route.query.industry      as string) || '',
  whatTheyOffer: (route.query.whatTheyOffer as string) || '',
  contactEmail:  (route.query.contactEmail  as string) || 'hello@yourbusiness.com',
  domain:        (route.query.domain        as string) || 'yourbusiness.com'
}
provide(SITE_CONTEXT_KEY, siteContext)

// ── Legal page block props ─────────────────────────────────────────────────────
const LEGAL_ID_MAP: Record<string, { key: keyof typeof composition.siteBuilder.legalContent; heading: string }> = {
  privacy:       { key: 'privacyPolicy',           heading: 'Privacy Policy' },
  terms:         { key: 'termsConditions',          heading: 'Terms & Conditions' },
  accessibility: { key: 'accessibilityStatement',  heading: 'Accessibility Statement' },
  cookie:        { key: 'cookiePolicy',             heading: 'Cookie Policy' }
}

function blockProps(id: string): Record<string, unknown> {
  const legal = LEGAL_ID_MAP[pageId]
  if (id === 'block-text' && legal) {
    const raw = composition.siteBuilder.legalContent[legal.key]
    if (raw) {
      // Strip leading h1 line (e.g. "# Privacy Policy") — heading prop already shows the title
      const body = raw.replace(/^#\s+[^\n]*\n?/, '')
      return { heading: legal.heading, body }
    }
  }
  return {}
}

// ── Component refs ────────────────────────────────────────────────────────────
const HeaderComponent   = shallowRef<Component | null>(null)
const FooterComponent   = shallowRef<Component | null>(null)
const TemplateComponent = shallowRef<Component | null>(null)
const blockMap          = shallowRef<Record<string, Component>>({})

// ── Brand font injection ───────────────────────────────────────────────────────
function injectBrandFonts(heading: string, body: string) {
  const isGeneric = (f: string) => ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', ''].includes(f)
  const toLoad = [heading, body].filter(f => !isGeneric(f))
  if (toLoad.length) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?${toLoad.map(f => `family=${encodeURIComponent(f)}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,700`).join('&')}&display=swap`
    document.head.appendChild(link)
  }
  const style = document.createElement('style')
  style.textContent = `body,p,span,li,a,td,th,label,input,textarea,button{font-family:'${body}',sans-serif}h1,h2,h3,h4,h5,h6{font-family:'${heading}',serif}`
  document.head.appendChild(style)
}

// ── Height reporting ──────────────────────────────────────────────────────────
function reportHeight() {
  window.parent.postMessage(
    { type: 'preview-height', height: document.documentElement.scrollHeight },
    '*'
  )
}

// ── Load all components on mount ──────────────────────────────────────────────
onMounted(async () => {
  // Header
  if (headerId) {
    const v = registry.getVariantById(headerId)
    if (v) HeaderComponent.value = (await v.component()).default
  }

  // Footer
  if (footerId) {
    const v = registry.getVariantById(footerId)
    if (v) FooterComponent.value = (await v.component()).default
  }

  // Page template
  if (templateId) {
    const t = registry.getTemplateById(templateId)
    if (t) TemplateComponent.value = (await t.component()).default
  }

  // All blocks across all slots (deduped)
  const allIds = [...new Set([
    ...blockIds,
    ...headerBlockIds,
    ...sidebarBlockIds,
    ...featuredBlockIds,
    ...rightBlockIds,
    ...col2BlockIds,
    ...col3BlockIds,
    ...secondaryBlockIds
  ])]

  const loaded: Record<string, Component> = {}
  for (const id of allIds) {
    const block = registry.getBlockById(id)
    if (block) loaded[id] = (await block.component()).default
  }
  blockMap.value = loaded

  // Apply brand colors, radius, fonts
  applyBrandColors(colorsLight)
  if (borderRadius) document.documentElement.style.setProperty('--theme-radius', borderRadius)
  injectBrandFonts(headingFont, bodyFont)

  // Start ResizeObserver after all components loaded
  const observer = new ResizeObserver(reportHeight)
  observer.observe(document.documentElement)
})
</script>

<template>
  <div class="bg-white">

    <!-- Header -->
    <Suspense v-if="HeaderComponent">
      <component
        :is="HeaderComponent"
        :site-name="siteName"
        :nav-links="navLinks.length ? navLinks : ['Home', 'About', 'Services', 'Contact']"
        :auth-enabled="authEnabled"
        :dark-mode-enabled="darkModeEnabled"
        :preview-mode="true"
      />
      <template #fallback>
        <div class="h-16 bg-gray-50 animate-pulse" />
      </template>
    </Suspense>

    <!-- Content blocks wrapped in page template if one is selected -->
    <component v-if="TemplateComponent" :is="TemplateComponent">
      <!-- Header slot (full-width, above columns) -->
      <template v-if="headerBlockIds.length" #header>
        <template v-for="id in headerBlockIds" :key="id">
          <component :is="blockMap[id]" v-if="blockMap[id]" v-bind="blockProps(id)" />
        </template>
      </template>

      <!-- Content slot (primary blocks) -->
      <template #content>
        <template v-for="id in blockIds" :key="id">
          <component :is="blockMap[id]" v-if="blockMap[id]" v-bind="blockProps(id)" />
        </template>
      </template>

      <!-- Featured slot -->
      <template v-if="featuredBlockIds.length" #featured>
        <template v-for="id in featuredBlockIds" :key="id">
          <component :is="blockMap[id]" v-if="blockMap[id]" v-bind="blockProps(id)" />
        </template>
      </template>

      <!-- Sidebar slot -->
      <template v-if="sidebarBlockIds.length" #sidebar>
        <template v-for="id in sidebarBlockIds" :key="id">
          <component :is="blockMap[id]" v-if="blockMap[id]" v-bind="blockProps(id)" />
        </template>
      </template>

      <!-- Right slot -->
      <template v-if="rightBlockIds.length" #right>
        <template v-for="id in rightBlockIds" :key="id">
          <component :is="blockMap[id]" v-if="blockMap[id]" v-bind="blockProps(id)" />
        </template>
      </template>

      <!-- Col 2 slot -->
      <template v-if="col2BlockIds.length" #col2>
        <template v-for="id in col2BlockIds" :key="id">
          <component :is="blockMap[id]" v-if="blockMap[id]" v-bind="blockProps(id)" />
        </template>
      </template>

      <!-- Col 3 slot -->
      <template v-if="col3BlockIds.length" #col3>
        <template v-for="id in col3BlockIds" :key="id">
          <component :is="blockMap[id]" v-if="blockMap[id]" v-bind="blockProps(id)" />
        </template>
      </template>

      <!-- Secondary slot -->
      <template v-if="secondaryBlockIds.length" #secondary>
        <template v-for="id in secondaryBlockIds" :key="id">
          <component :is="blockMap[id]" v-if="blockMap[id]" v-bind="blockProps(id)" />
        </template>
      </template>
    </component>

    <!-- No template: stack blocks directly -->
    <template v-else>
      <template v-for="id in blockIds" :key="id">
        <component :is="blockMap[id]" v-if="blockMap[id]" v-bind="blockProps(id)" />
      </template>
    </template>

    <!-- Footer -->
    <Suspense v-if="FooterComponent">
      <component
        :is="FooterComponent"
        :site-name="siteName"
        :copyright-text="copyrightText"
        :nav-links="footerNavLinks.length ? footerNavLinks : ['Privacy Policy', 'Terms & Conditions', 'Accessibility']"
        :social-links="socialLinks.length ? socialLinks : undefined"
      />
      <template #fallback>
        <div class="h-24 bg-gray-50 animate-pulse" />
      </template>
    </Suspense>

  </div>
</template>
