<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  siteName?: string
  navLinks?: string[]
  authEnabled?: boolean
  darkModeEnabled?: boolean
}>()

const collapsed = ref(false)
const isLoggedIn = ref(false)
const accountOpen = ref(false)

const user = { name: 'Jane Smith', email: 'jane@example.com', initials: 'JS' }

const navItems = [
  { label: 'Dashboard', icon: 'grid' },
  { label: 'Analytics', icon: 'bar-chart' },
  { label: 'Customers', icon: 'users' },
  { label: 'Products', icon: 'package' },
  { label: 'Settings', icon: 'settings' }
]

// Simple icon paths by name
const icons: Record<string, string> = {
  'grid': 'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z',
  'bar-chart': 'M12 20V10M18 20V4M6 20v-4',
  'users': 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  'package': 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z',
  'settings': 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z'
}
</script>

<template>
  <!-- Sidebar renders as a fixed vertical nav — for preview it displays inline -->
  <aside
    class="flex flex-col bg-gray-900 text-white transition-all duration-300 h-full min-h-[300px]"
    :class="collapsed ? 'w-16' : 'w-56'"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-5 border-b border-gray-700">
      <span v-if="!collapsed" class="font-bold text-base truncate">{{ siteName || 'App Name' }}</span>
      <button
        @click="collapsed = !collapsed"
        class="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors shrink-0"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="collapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7m8 14l-7-7 7-7'"/>
        </svg>
      </button>
    </div>

    <!-- Nav items -->
    <nav class="flex-1 p-3 space-y-1">
      <a
        v-for="(item, i) in navItems"
        :key="item.label"
        href="#"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
        :class="i === 0
          ? 'bg-blue-600 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'"
        :title="collapsed ? item.label : undefined"
      >
        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" :d="icons[item.icon]"/>
        </svg>
        <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
      </a>
    </nav>

    <!-- Dark mode slot — pinned above auth -->
    <div v-if="darkModeEnabled" class="border-t border-gray-700 p-3">
      <button
        class="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        :title="collapsed ? 'Toggle dark mode' : undefined"
        @click="$el.closest('aside').classList.toggle('dark-mode-on')"
        aria-label="Toggle dark mode"
      >
        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
        </svg>
        <span v-if="!collapsed" class="text-sm font-medium">Dark Mode</span>
      </button>
    </div>

    <!-- Auth slot — pinned to sidebar bottom -->
    <div v-if="authEnabled" class="border-t border-gray-700 p-3 relative">

      <!-- Logged-out state -->
      <button
        v-if="!isLoggedIn"
        @click="isLoggedIn = true"
        class="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        :title="collapsed ? 'Log in' : undefined"
      >
        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
        <span v-if="!collapsed" class="text-sm font-medium">Log in</span>
      </button>

      <!-- Logged-in state -->
      <div v-else>
        <button
          @click="accountOpen = !accountOpen"
          class="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
          :title="collapsed ? user.name : undefined"
        >
          <span class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
            {{ user.initials }}
          </span>
          <div v-if="!collapsed" class="flex-1 min-w-0 text-left">
            <p class="text-sm font-medium text-white truncate">{{ user.name }}</p>
            <p class="text-xs text-gray-400 truncate">{{ user.email }}</p>
          </div>
          <svg v-if="!collapsed" class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>
          </svg>
        </button>

        <!-- Account popover (opens upward) -->
        <div
          v-if="accountOpen"
          class="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden z-50"
        >
          <div class="px-4 py-3 border-b border-gray-100">
            <p class="text-sm font-semibold text-gray-900">{{ user.name }}</p>
            <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
          </div>
          <div class="py-1">
            <a href="#" class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Profile
            </a>
            <a href="#" class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Settings
            </a>
          </div>
          <div class="border-t border-gray-100 py-1">
            <button
              @click="isLoggedIn = false; accountOpen = false"
              class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Log out
            </button>
          </div>
        </div>
      </div>

      <!-- Backdrop -->
      <div v-if="accountOpen" class="fixed inset-0 z-40" @click="accountOpen = false" />
    </div>
  </aside>
</template>
