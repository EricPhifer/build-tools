import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'pws-theme-mode'

const getInitialMode = (): ThemeMode => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  // Check system preference for dark mode
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(getInitialMode())

  const isDark = computed(() => mode.value === 'dark')

  const setMode = (newMode: ThemeMode) => {
    mode.value = newMode
    applyTheme()
  }

  const toggleMode = () => {
    mode.value = mode.value === 'light' ? 'dark' : 'light'
    applyTheme()
  }

  const applyTheme = () => {
    const root = document.documentElement

    // Always use teal-warmth color scheme
    root.setAttribute('data-color-scheme', 'teal-warmth')
    root.setAttribute('data-mode', mode.value)

    // Toggle dark class for Tailwind
    if (mode.value === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Persist mode to localStorage
    localStorage.setItem(STORAGE_KEY, mode.value)
  }

  // Watch for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    // Only auto-switch if user hasn't manually set a preference
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      mode.value = e.matches ? 'dark' : 'light'
      applyTheme()
    }
  })

  // Apply theme on store initialization
  applyTheme()

  return {
    mode,
    isDark,
    setMode,
    toggleMode,
    applyTheme
  }
})
