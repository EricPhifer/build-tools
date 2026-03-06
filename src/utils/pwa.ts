/**
 * PWA detection utilities.
 * Used to adjust auth flow and other behaviors based on how the app is running.
 */

/** Whether the app is running as an installed PWA (standalone mode) */
export function isPWA(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

/** Whether the app is running as a Mac Desktop PWA (Safari WebKit standalone) */
export function isMacDesktopPWA(): boolean {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  // iOS PWA uses navigator.standalone; Mac Desktop standalone uses the media query
  const isIOSPWA = (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  const isMac = /Mac/.test(navigator.platform) || /Macintosh/.test(navigator.userAgent)
  // Mac Desktop PWA: standalone via media query, on Mac, but NOT iOS (iPad can report as Mac)
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (isMac && navigator.maxTouchPoints > 1)
  return isStandalone && !isIOSPWA && isMac && !isIOS
}

/** Log PWA environment info (for auth debugging) */
export function logPWAEnvironment(): void {
  if (import.meta.env.PROD) return // Only log in dev
  console.log('[PWA] Environment:', {
    isPWA: isPWA(),
    isMacDesktopPWA: isMacDesktopPWA(),
    displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
    origin: window.location.origin,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints
  })
}
