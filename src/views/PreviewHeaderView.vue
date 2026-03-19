<script setup lang="ts">
import { shallowRef, onMounted, type Component } from 'vue'
import { useRoute } from 'vue-router'
import { useRegistryStore } from '../stores/registry'

const route = useRoute()
const registry = useRegistryStore()

const PreviewComponent = shallowRef<Component | null>(null)

const id = route.query.id as string
const siteName = (route.query.siteName as string) || 'Your Business'
const navLinks = ((route.query.navLinks as string) || 'Home,About,Services,Contact').split(',')
const authEnabled = route.query.authEnabled === 'true'
const darkModeEnabled = route.query.darkModeEnabled === 'true'
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

function reportHeight() {
  const height = document.documentElement.scrollHeight
  window.parent.postMessage({ type: 'preview-height', height }, '*')
}

onMounted(async () => {
  const variant = registry.getVariantById(id)
  if (!variant) return

  const module = await variant.component()
  PreviewComponent.value = module.default

  applyBrandColors(colorsLight)
  if (borderRadius) document.documentElement.style.setProperty('--theme-radius', borderRadius)
  injectBrandFonts(headingFont, bodyFont)

  // Watch for content size changes (mobile menu open/close, announcement bars, etc.)
  const observer = new ResizeObserver(reportHeight)
  observer.observe(document.documentElement)
})
</script>

<template>
  <div ref="wrapper" class="bg-white">
    <Suspense>
      <component
        :is="PreviewComponent"
        v-if="PreviewComponent"
        :site-name="siteName"
        :nav-links="navLinks"
        :auth-enabled="authEnabled"
        :dark-mode-enabled="darkModeEnabled"
        :preview-mode="true"
      />
      <template #fallback>
        <div class="p-8 text-center text-sm text-gray-400">Loading...</div>
      </template>
    </Suspense>
  </div>
</template>
