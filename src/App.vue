<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { ChevronRight } from 'lucide-vue-next'
import AuthGuard from './components/AuthGuard.vue'
import Sidebar from './components/Sidebar.vue'
import { useThemeStore } from './stores/theme'
import { useSidebarStore } from './stores/sidebar'
import LogoIcon from './components/LogoIcon.vue'
import { isPWA } from './utils/pwa'

const route = useRoute()
const { error, isAuthenticated, isLoading } = useAuth0()

// Initialize stores
useThemeStore()
const sidebar = useSidebarStore()

// Dynamic mobile header title
const mobileHeaderTitle = computed(() => {
  const path = route.path
  if (path.startsWith('/client')) return 'Client Setup'
  if (path === '/site/header') return 'Headers'
  if (path === '/site/footer') return 'Footers'
  if (path === '/site/main') return 'Main Content'
  if (path.startsWith('/site')) return 'Site Builder'
  if (path.startsWith('/cms')) return 'CMS'
  if (path === '/products/portfolio') return 'Portfolio'
  if (path.startsWith('/products')) return 'Final Products'
  if (path.startsWith('/dashboards')) return 'Dashboards'
  if (path.startsWith('/finalize')) return 'Finalize'
  return 'Build Tools'
})

// Initialize sidebar mobile detection
onMounted(() => {
  sidebar.init()

  // Monitor auth state in PWA mode for debugging
  if (isPWA()) {
    watch(isAuthenticated, (val) => {
      console.log('[App] Auth state changed: authenticated =', val)
    })
    watch(error, (err) => {
      if (err) console.error('[App] Auth0 error:', err.message)
    })
    watch(isLoading, (val) => {
      if (!val) console.log('[App] Auth0 finished loading, authenticated =', isAuthenticated.value)
    })
  }
})

onUnmounted(() => {
  sidebar.cleanup()
})

// Check if current route is a public route (no auth required)
const isPublicRoute = computed(() => {
  return route.meta?.public === true || route.meta?.requiresAuth === false
})
</script>

<template>
  <!-- Public Routes (no sidebar, no auth) -->
  <template v-if="isPublicRoute">
    <router-view />
  </template>

  <!-- Protected Routes (with sidebar and auth) -->
  <template v-else>
    <AuthGuard>
      <div
        v-if="error"
        class="min-h-screen flex items-center justify-center transition-colors duration-300"
        :style="{ backgroundColor: 'var(--theme-bg-secondary)' }"
      >
        <div
          class="p-8 rounded-2xl text-center shadow-2xl max-w-md"
          :style="{ backgroundColor: 'var(--theme-danger)', color: 'var(--theme-text-inverse)' }"
        >
          <h2 class="text-3xl font-bold mb-2">Oops!</h2>
          <p class="text-xl mb-2">Something went wrong</p>
          <p class="opacity-80">{{ error.message }}</p>
        </div>
      </div>

      <div
        v-else
        class="min-h-screen flex flex-col lg:flex-row transition-colors duration-300"
        :style="{ backgroundColor: 'var(--theme-bg-secondary)' }"
      >
        <!-- Mobile Header -->
        <header
          v-if="sidebar.isMobile"
          class="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b lg:hidden"
          :style="{
            backgroundColor: 'var(--theme-sidebar-bg)',
            borderColor: 'var(--theme-border)',
            paddingTop: 'max(env(safe-area-inset-top), 12px)'
          }"
        >
          <button
            @click="sidebar.toggleMobile"
            class="w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300"
            :style="{ color: 'var(--theme-text-primary)' }"
            :title="sidebar.isMobileOpen ? 'Close menu' : 'Open menu'"
          >
            <ChevronRight
              class="w-6 h-6 transition-transform duration-300"
              :class="sidebar.isMobileOpen ? 'rotate-180' : 'rotate-0'"
            />
          </button>
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <LogoIcon class="w-7 h-7 flex-shrink-0" :style="{ color: 'var(--theme-primary)' }" />
            <span class="font-semibold text-sm truncate" :style="{ color: 'var(--theme-text-primary)' }">{{ mobileHeaderTitle }}</span>
          </div>
        </header>

        <Sidebar />
        <div class="flex-1 transition-all duration-300" :style="{ marginLeft: sidebar.width }">
          <router-view />
        </div>
      </div>
    </AuthGuard>
  </template>
</template>
