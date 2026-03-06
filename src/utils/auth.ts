import { auth0Plugin } from '../plugins/auth0'

// Wait for Auth0 to finish loading (important for Firefox)
async function waitForAuth0Ready(maxWaitMs = 3000): Promise<boolean> {
  const startTime = Date.now()

  while (Date.now() - startTime < maxWaitMs) {
    // Check if Auth0 is done loading
    if (!auth0Plugin.isLoading.value) {
      return true
    }
    // Wait a bit and check again
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return false
}

// Get the auth token from Auth0 (uses ID token since no API audience is configured)
export async function getAuthToken(): Promise<string | null> {
  try {
    // Wait for Auth0 to finish initializing (handles Firefox timing issues)
    await waitForAuth0Ready()

    // Check if user is authenticated (isAuthenticated is a ref)
    const isAuth = auth0Plugin.isAuthenticated
    if (isAuth && !isAuth.value) {
      // Not authenticated - return cached token if available (for edge cases)
      return localStorage.getItem('auth_token')
    }

    // Use the ID token directly - it proves the user is authenticated
    // We skip getAccessTokenSilently() because it requires an API audience to be configured
    const idTokenClaims = auth0Plugin.idTokenClaims
    if (idTokenClaims?.value && idTokenClaims.value.__raw) {
      const idToken = idTokenClaims.value.__raw
      localStorage.setItem('auth_token', idToken)
      return idToken
    }

    return localStorage.getItem('auth_token')
  } catch (err) {
    console.warn('Could not get Auth0 token:', err)

    // Fallback to cached token in localStorage
    return localStorage.getItem('auth_token')
  }
}

// Clear cached auth token
export function clearAuthToken(): void {
  localStorage.removeItem('auth_token')
}
