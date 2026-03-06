<script setup lang="ts">
import { ref } from 'vue'

// In a real integration this state comes from Auth0 / your auth store.
// Here we use local refs so the picker can demo both states interactively.
defineProps<{
  fullWidth?: boolean
}>()

const isLoggedIn = ref(false)
const menuOpen = ref(false)

const user = { name: 'Jane Smith', email: 'jane@example.com', initials: 'JS' }

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function logout() {
  isLoggedIn.value = false
  menuOpen.value = false
}
</script>

<template>
  <div :class="fullWidth ? 'w-full' : 'relative flex items-center shrink-0'">
    <!-- Logged-out state -->
    <button
      v-if="!isLoggedIn"
      @click="isLoggedIn = true"
      :class="fullWidth
        ? 'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors hover:bg-gray-50'
        : 'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors hover:bg-gray-50'"
      style="border-color: #d1d5db; color: #374151;"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
      Log in
    </button>

    <!-- Logged-in state: avatar + dropdown -->
    <div v-else :class="fullWidth ? 'relative w-full' : 'relative'">
      <!-- Compact (desktop header) -->
      <button
        v-if="!fullWidth"
        @click="toggleMenu"
        class="flex items-center gap-2 rounded-full focus:outline-none"
        aria-label="Account menu"
      >
        <span
          class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style="background-color: #2563eb;"
        >{{ user.initials }}</span>
        <svg class="w-3.5 h-3.5 text-gray-400 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      <!-- Full-width user row (mobile menu) -->
      <button
        v-else
        @click="toggleMenu"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        aria-label="Account menu"
      >
        <span
          class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style="background-color: #2563eb;"
        >{{ user.initials }}</span>
        <div class="flex-1 text-left min-w-0">
          <p class="text-sm font-medium text-gray-900 leading-none">{{ user.name }}</p>
          <p class="text-xs text-gray-500 truncate mt-0.5">{{ user.email }}</p>
        </div>
        <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      <!-- Dropdown menu -->
      <div
        v-if="menuOpen"
        class="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden"
      >
        <!-- User info -->
        <div class="px-4 py-3 border-b border-gray-100">
          <p class="text-sm font-semibold text-gray-900">{{ user.name }}</p>
          <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
        </div>
        <!-- Links -->
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Settings
          </a>
        </div>
        <!-- Logout -->
        <div class="border-t border-gray-100 py-1">
          <button
            @click="logout"
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

      <!-- Backdrop to close menu -->
      <div v-if="menuOpen" class="fixed inset-0 z-40" @click="menuOpen = false" />
    </div>
  </div>
</template>
