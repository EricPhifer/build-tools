import { createAuth0 } from '@auth0/auth0-vue'
import { isPWA, logPWAEnvironment } from '../utils/pwa'

const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID

// Validate Auth0 configuration
if (!domain || !clientId) {
  console.error('Auth0 configuration missing. Please check your .env file.')
  console.error('Required environment variables:')
  console.error('- VITE_AUTH0_DOMAIN')
  console.error('- VITE_AUTH0_CLIENT_ID')
  throw new Error('Auth0 domain and client ID must be set in .env file')
}

// Validate domain format
if (!domain.includes('.auth0.com') && !domain.includes('.us.auth0.com') && !domain.includes('.eu.auth0.com') && !domain.includes('.au.auth0.com')) {
  console.warn('Auth0 domain format might be incorrect. Expected format: your-domain.auth0.com')
}

// Log PWA environment for debugging auth issues
logPWAEnvironment()

export const auth0Plugin = createAuth0({
  domain,
  clientId,
  authorizationParams: {
    redirect_uri: window.location.origin,
    // Request offline_access so Auth0 issues refresh tokens (required for useRefreshTokens)
    ...(isPWA() && { scope: 'openid profile email offline_access' })
  },
  cacheLocation: 'localstorage',
  // Use cookies for transaction state (nonce, state) - helps with PWA popup issues
  // where localStorage context may differ between PWA and popup window
  useCookiesForTransactions: true,
  // Use refresh tokens for better cross-browser support (Firefox blocks iframe-based silent auth)
  useRefreshTokens: true,
  // Fallback to iframe-based silent auth when refresh token fails
  useRefreshTokensFallback: true
})
