import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useSidebarStore = defineStore('sidebar', () => {
  const isCollapsed = ref(localStorage.getItem('sidebar-collapsed') === 'true')
  const isMobileOpen = ref(false)
  const isMobile = ref(false)

  // Mobile breakpoint (matches Tailwind's lg: 1024px)
  const MOBILE_BREAKPOINT = 1024

  const width = computed(() => {
    if (isMobile.value) return '0px'
    return isCollapsed.value ? '4rem' : '15rem'
  })

  const widthClass = computed(() => (isCollapsed.value ? 'w-16' : 'w-60'))

  function checkMobile() {
    isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
    // Close mobile menu when resizing to desktop
    if (!isMobile.value) {
      isMobileOpen.value = false
    }
  }

  function toggle() {
    isCollapsed.value = !isCollapsed.value
    localStorage.setItem('sidebar-collapsed', String(isCollapsed.value))
  }

  function expand() {
    isCollapsed.value = false
    localStorage.setItem('sidebar-collapsed', 'false')
  }

  function collapse() {
    isCollapsed.value = true
    localStorage.setItem('sidebar-collapsed', 'true')
  }

  function openMobile() {
    isMobileOpen.value = true
  }

  function closeMobile() {
    isMobileOpen.value = false
  }

  function toggleMobile() {
    isMobileOpen.value = !isMobileOpen.value
  }

  // Initialize and listen for resize
  function init() {
    checkMobile()
    window.addEventListener('resize', checkMobile)
  }

  function cleanup() {
    window.removeEventListener('resize', checkMobile)
  }

  return {
    isCollapsed,
    isMobileOpen,
    isMobile,
    width,
    widthClass,
    toggle,
    expand,
    collapse,
    openMobile,
    closeMobile,
    toggleMobile,
    init,
    cleanup
  }
})
