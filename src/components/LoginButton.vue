<script setup lang="ts">
import { ref } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { isPWA, isMacDesktopPWA } from '../utils/pwa'

const { loginWithRedirect, loginWithPopup, isLoading } = useAuth0()
const isLoggingIn = ref(false)
const loginError = ref('')

const handleLogin = async () => {
  isLoggingIn.value = true
  loginError.value = ''

  try {
    if (isMacDesktopPWA()) {
      try {
        await loginWithPopup({
          authorizationParams: {
            redirect_uri: window.location.origin,
            scope: 'openid profile email offline_access'
          }
        })
        return
      } catch (popupErr) {
        console.warn('[Auth] Popup login failed on Mac PWA, falling back to redirect:', popupErr)
      }
      await loginWithRedirect({
        authorizationParams: {
          redirect_uri: window.location.origin,
          scope: 'openid profile email offline_access'
        }
      })
    } else if (isPWA()) {
      try {
        await loginWithPopup({
          authorizationParams: {
            redirect_uri: window.location.origin
          }
        })
      } catch (popupError: unknown) {
        console.error('[Auth] Popup login failed:', popupError)
        const errorMessage = popupError instanceof Error ? popupError.message : String(popupError)
        if (errorMessage.includes('Popup closed') || errorMessage.includes('popup_closed')) {
          loginError.value = 'Sign-in window was closed. Please try again.'
        } else {
          loginError.value = `Sign in issue: ${errorMessage}. Please allow popups for this site and try again.`
        }
      }
    } else {
      await loginWithRedirect()
    }
  } catch (error) {
    console.error('[Auth] Login failed:', error)
    loginError.value = 'Login failed. Please try again.'
  } finally {
    isLoggingIn.value = false
  }
}
</script>

<template>
  <div>
    <button
      @click="handleLogin"
      class="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="isLoading || isLoggingIn"
    >
      {{ isLoggingIn ? 'Signing in...' : isLoading ? 'Loading...' : 'Sign In' }}
    </button>
    <p v-if="loginError" class="mt-3 text-sm text-red-600 text-center">
      {{ loginError }}
    </p>
  </div>
</template>
