<script setup lang="ts">
import { ref } from 'vue'
import DarkModeSlot from './DarkModeSlot.vue'

defineProps<{
  siteName?: string
  navLinks?: string[]
  darkModeEnabled?: boolean
}>()

// Demo state — in a real integration this comes from Auth0 / auth store
const isLoggedIn = ref(false)
const accountOpen = ref(false)
const notifOpen = ref(false)
const mobileOpen = ref(false)

const user = { name: 'Jane Smith', email: 'jane@example.com', role: 'Admin', initials: 'JS' }

const notifications = [
  { id: 1, text: 'Your report is ready to download.', time: '2m ago', read: false },
  { id: 2, text: 'New comment on Project Alpha.', time: '1h ago', read: false },
  { id: 3, text: 'Invoice #1042 has been paid.', time: 'Yesterday', read: true }
]

const unreadCount = notifications.filter(n => !n.read).length

function login() { isLoggedIn.value = true }
function logout() { isLoggedIn.value = false; accountOpen.value = false; mobileOpen.value = false }
</script>

<template>
  <header class="bg-white border-b border-gray-200 relative z-50">
    <div class="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-6">

      <!-- Logo + app name -->
      <div class="flex items-center gap-3 shrink-0">
        <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
          </svg>
        </div>
        <span class="font-bold text-gray-900">{{ siteName || 'Portal' }}</span>
      </div>

      <!-- Nav links (secondary) -->
      <nav class="hidden md:flex items-center gap-1 flex-1">
        <a
          v-for="(link, i) in (navLinks || ['Dashboard', 'Projects', 'Reports', 'Help'])"
          :key="link"
          href="#"
          class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
          :class="i === 0
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'"
        >{{ link }}</a>
      </nav>

      <!-- Logged-out state (desktop) -->
      <div v-if="!isLoggedIn" class="flex items-center gap-2 shrink-0">
        <DarkModeSlot v-if="darkModeEnabled" class="hidden md:flex" />
        <button
          @click="login"
          class="hidden md:block px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >Log in</button>
        <button
          @click="login"
          class="hidden md:block px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >Sign up</button>
        <!-- Mobile hamburger (logged out) -->
        <button
          class="md:hidden p-2 text-gray-600"
          @click="mobileOpen = !mobileOpen"
          :aria-expanded="mobileOpen"
        >
          <svg v-if="!mobileOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Logged-in state: notifications + account -->
      <div v-else class="flex items-center gap-1 shrink-0">
        <DarkModeSlot v-if="darkModeEnabled" class="hidden md:flex" />

        <!-- Notification bell -->
        <div class="relative">
          <button
            @click="notifOpen = !notifOpen; accountOpen = false"
            class="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <span
              v-if="unreadCount > 0"
              class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none"
            >{{ unreadCount }}</span>
          </button>

          <!-- Notifications dropdown -->
          <div
            v-if="notifOpen"
            class="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden"
          >
            <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p class="text-sm font-semibold text-gray-900">Notifications</p>
              <span class="text-xs text-blue-600 cursor-pointer hover:underline">Mark all read</span>
            </div>
            <ul class="divide-y divide-gray-100">
              <li
                v-for="notif in notifications"
                :key="notif.id"
                class="px-4 py-3 flex items-start gap-3 transition-colors"
                :class="notif.read ? '' : 'bg-blue-50/50'"
              >
                <span
                  class="mt-1.5 w-2 h-2 rounded-full shrink-0"
                  :class="notif.read ? 'bg-gray-200' : 'bg-blue-500'"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-800">{{ notif.text }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ notif.time }}</p>
                </div>
              </li>
            </ul>
            <div class="px-4 py-2.5 border-t border-gray-100 text-center">
              <a href="#" class="text-xs text-blue-600 hover:underline">View all notifications</a>
            </div>
          </div>
        </div>

        <!-- Account avatar + dropdown -->
        <div class="relative">
          <button
            @click="accountOpen = !accountOpen; notifOpen = false"
            class="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Account menu"
          >
            <span class="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {{ user.initials }}
            </span>
            <div class="hidden md:block text-left">
              <p class="text-xs font-semibold text-gray-900 leading-none">{{ user.name }}</p>
              <p class="text-xs text-gray-400 leading-none mt-0.5">{{ user.role }}</p>
            </div>
            <svg class="w-3.5 h-3.5 text-gray-400 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <!-- Account dropdown -->
          <div
            v-if="accountOpen"
            class="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden"
          >
            <div class="px-4 py-3 border-b border-gray-100">
              <p class="text-sm font-semibold text-gray-900">{{ user.name }}</p>
              <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
              <span class="mt-1.5 inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{{ user.role }}</span>
            </div>
            <div class="py-1">
              <a href="#" class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Profile
              </a>
              <a href="#" class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                Organization
              </a>
              <a href="#" class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Settings
              </a>
            </div>
            <div class="border-t border-gray-100 py-1">
              <button
                @click="logout"
                class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Log out
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile hamburger (logged in) -->
        <button
          class="md:hidden p-2 text-gray-600 ml-1"
          @click="mobileOpen = !mobileOpen; accountOpen = false; notifOpen = false"
          :aria-expanded="mobileOpen"
        >
          <svg v-if="!mobileOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

    </div>

    <!-- Mobile nav menu -->
    <div v-if="mobileOpen" class="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
      <nav class="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1">
        <a
          v-for="(link, i) in (navLinks || ['Dashboard', 'Projects', 'Reports', 'Help'])"
          :key="link"
          href="#"
          class="px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :class="i === 0 ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'"
          @click="mobileOpen = false"
        >{{ link }}</a>
        <div v-if="!isLoggedIn" class="pt-3 border-t border-gray-100 mt-2 flex flex-col gap-2">
          <button @click="login; mobileOpen = false" class="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Log in</button>
          <button @click="login; mobileOpen = false" class="w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">Sign up</button>
        </div>
      </nav>
    </div>

    <!-- Backdrops to close dropdowns -->
    <div v-if="accountOpen || notifOpen || mobileOpen" class="fixed inset-0 z-40" @click="accountOpen = false; notifOpen = false; mobileOpen = false" />
  </header>
</template>
