import { ref } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import type {
  ClientInfo, BrandKit, BrandFont, BrandThemeColors,
  ConnectedWebsite, ManagedService, ClientHealthCheck, HealthCheckAreaScore
} from '../types/registry'

// ─── Client Dashboard shapes ──────────────────────────────────────────────────

interface BrandKitColors {
  primary?: string
  primaryHover?: string
  primaryLight?: string
  secondary?: string
  secondaryHover?: string
  accent?: string
  accentHover?: string
  bgPrimary?: string
  bgSecondary?: string
  bgTertiary?: string
  bgCard?: string
  bgHover?: string
  textPrimary?: string
  textSecondary?: string
  textMuted?: string
  textInverse?: string
  border?: string
  borderLight?: string
  success?: string
  successLight?: string
  warning?: string
  warningLight?: string
  danger?: string
  dangerLight?: string
  sidebarBg?: string
  sidebarText?: string
  sidebarHover?: string
  sidebarActive?: string
}

interface TursoClient {
  id: string
  name: string | null
  businessName: string | null
  email: string | null
  phone: string | null
  website: string | null
  status: string | null
  projectStatus: string | null
  brandKit: {
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
    lightColors?: BrandKitColors
    darkColors?: BrandKitColors
    logoUrl?: string
    fonts?: string | Record<string, unknown>
    guidelines?: string
  } | null
  cityRegion: string | null
  businessDescription: string | null
  notes: string | null
  idealCustomer: string | null
  connectedWebsites: string | null      // JSON: ConnectedWebsite[]
  managedServices: string | null        // JSON: ManagedService[]
  healthCheckResults: string | null     // JSON: { searchVisibility, googleBusiness, ... }
  healthCheckScore: number | null
  healthCheckDate: string | null
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

function parseJson<T>(json: string | null | unknown): T | null {
  if (!json || typeof json !== 'string') return null
  try { return JSON.parse(json) as T } catch { return null }
}

function parseConnectedWebsites(json: string | null): ConnectedWebsite[] {
  return parseJson<ConnectedWebsite[]>(json) ?? []
}

function parseManagedServices(json: string | null): ManagedService[] | undefined {
  const raw = parseJson<ManagedService[]>(json)
  return raw?.length ? raw : undefined
}

function parseHealthCheck(
  resultsJson: string | null,
  score: number | null,
  date: string | null
): ClientHealthCheck | undefined {
  if (!score && !resultsJson) return undefined

  const areas: Partial<ClientHealthCheck> = {}
  const raw = parseJson<Record<string, { score?: number; evidence?: Record<string, unknown> }>>(resultsJson)

  if (raw) {
    const areaKeys: (keyof ClientHealthCheck)[] = [
      'searchVisibility', 'googleBusiness', 'socialPresence',
      'websiteDiscovery', 'brandConsistency', 'contactAccessibility', 'trustCompliance'
    ]
    for (const key of areaKeys) {
      const area = raw[key]
      if (area?.score !== undefined) {
        (areas as Record<string, HealthCheckAreaScore>)[key] = {
          score: area.score,
          evidence: area.evidence
        }
      }
    }
  }

  return { score: score ?? 0, date: date ?? undefined, ...areas }
}

/**
 * Extract the full domain (slug + TLD) from connected_websites Main Website entry.
 * Returns e.g. "acme.com", "acme.co.uk" — never strips the TLD.
 * Fallback: derives a slug from businessName with ".com".
 */
function extractMainWebsiteDomain(sites: ConnectedWebsite[], fallbackName: string): string {
  const main = sites.find(s => s.label === 'Main Website')
  if (main?.url) {
    const url = main.url.trim()
    try {
      const raw = url.startsWith('http') ? url : `https://${url}`
      return new URL(raw).hostname.replace(/^www\./, '')
    } catch {
      // URL without protocol stored without slashes — use as-is minus www
      return url.replace(/^www\./, '')
    }
  }
  return fallbackName.toLowerCase().replace(/[^a-z0-9]+/g, '') + '.com'
}

function mapThemeColors(colors: BrandKitColors | undefined): BrandThemeColors | undefined {
  if (!colors) return undefined
  return { ...colors }
}

// ─── Mapping ──────────────────────────────────────────────────────────────────

function mapBrandKit(remote: TursoClient['brandKit']): BrandKit {
  const light = remote?.lightColors
  const dark = remote?.darkColors

  // Prefer new lightColors, fall back to legacy flat fields
  const primary = light?.primary ?? remote?.primaryColor ?? '#2D6A4F'
  const secondary = light?.secondary ?? remote?.secondaryColor ?? '#40916C'
  const accent = light?.accent ?? remote?.accentColor ?? '#95D5B2'
  const neutral = light?.bgPrimary ?? '#F5F5F5'

  let fonts: BrandFont[]
  if (remote?.fonts && typeof remote.fonts === 'string') {
    // Legacy: comma-separated "Heading Font, Body Font"
    const parts = remote.fonts.split(',').map((f: string) => f.trim()).filter(Boolean)
    fonts = parts.length >= 2
      ? [{ name: parts[0]!, category: 'heading' }, { name: parts[1]!, category: 'body' }]
      : [{ name: 'Playfair Display', category: 'heading' }, { name: parts[0]!, category: 'body' }]
  } else if (remote?.fonts && typeof remote.fonts === 'object') {
    // New format: { heading: { name, importUrl, weights }, body: { name, importUrl, weights } }
    const f = remote.fonts as { heading?: { name?: string; importUrl?: string; weights?: number[] }; body?: { name?: string; importUrl?: string; weights?: number[] } }
    fonts = [
      { name: f.heading?.name ?? 'Playfair Display', category: 'heading', importUrl: f.heading?.importUrl, weights: f.heading?.weights },
      { name: f.body?.name ?? 'Inter', category: 'body', importUrl: f.body?.importUrl, weights: f.body?.weights }
    ]
  } else {
    fonts = [
      { name: 'Playfair Display', category: 'heading' },
      { name: 'Inter', category: 'body' }
    ]
  }

  return {
    colors: {
      primary,
      secondary,
      accent,
      neutral,
      primaryDark: dark?.primary || undefined,
      secondaryDark: dark?.secondary || undefined,
      accentDark: dark?.accent || undefined,
      neutralDark: dark?.bgPrimary || undefined,
      light: mapThemeColors(light),
      dark: mapThemeColors(dark)
    },
    fonts,
    logoUrl: remote?.logoUrl ?? null,
    whatTheyOffer: '',
    industry: ''
  }
}

function mapToClientInfo(remote: TursoClient): ClientInfo {
  const businessName = remote.businessName ?? remote.name ?? ''
  const sites = parseConnectedWebsites(remote.connectedWebsites)
  const brandKit = mapBrandKit(remote.brandKit)

  return {
    id: remote.id,
    name: businessName,
    contactEmail: remote.email ?? '',
    domain: extractMainWebsiteDomain(sites, businessName),
    brandKit: {
      ...brandKit,
      whatTheyOffer: remote.businessDescription ?? ''
    },
    idealCustomer: remote.idealCustomer ?? '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    connectedWebsites: sites.length > 0 ? sites : undefined,
    managedServices: parseManagedServices(remote.managedServices),
    healthCheck: parseHealthCheck(remote.healthCheckResults, remote.healthCheckScore, remote.healthCheckDate)
  }
}

// ─── Brand Kit API shape (from get-brand-kit endpoint) ────────────────────────

interface ApiBrandKitColors {
  primary?: string
  secondary?: string
  accent?: string
  light?: BrandKitColors
  dark?: BrandKitColors
}

interface ApiBrandKit {
  colors?: ApiBrandKitColors
  fonts?: {
    heading?: { name: string; importUrl?: string; weights?: number[] }
    body?: { name: string; importUrl?: string; weights?: number[] }
  }
  logos?: { primary?: string; dark?: string; favicon?: string }
  borderRadius?: string
  guidelines?: { voice?: string; usage?: string; notes?: string }
}

function mapApiBrandKit(api: ApiBrandKit): BrandKit {
  const c = api.colors ?? {}
  const light = c.light
  const dark = c.dark

  const primary = light?.primary ?? c.primary ?? '#2D6A4F'
  const secondary = light?.secondary ?? c.secondary ?? '#40916C'
  const accent = light?.accent ?? c.accent ?? '#95D5B2'
  const neutral = light?.bgPrimary ?? '#F5F5F5'

  const hFont = api.fonts?.heading
  const bFont = api.fonts?.body
  const fonts: BrandFont[] = [
    {
      name: hFont?.name ?? 'Playfair Display',
      category: 'heading',
      importUrl: hFont?.importUrl,
      weights: hFont?.weights
    },
    {
      name: bFont?.name ?? 'Inter',
      category: 'body',
      importUrl: bFont?.importUrl,
      weights: bFont?.weights
    }
  ]

  return {
    colors: {
      primary,
      secondary,
      accent,
      neutral,
      primaryHover: light?.primaryHover || undefined,
      primaryLight: light?.primaryLight || undefined,
      secondaryHover: light?.secondaryHover || undefined,
      accentHover: light?.accentHover || undefined,
      background: light?.bgPrimary || undefined,
      surface: light?.bgSecondary || undefined,
      text: light?.textPrimary || undefined,
      textSecondary: light?.textSecondary || undefined,
      border: light?.border || undefined,
      primaryDark: dark?.primary || undefined,
      secondaryDark: dark?.secondary || undefined,
      accentDark: dark?.accent || undefined,
      backgroundDark: dark?.bgPrimary || undefined,
      surfaceDark: dark?.bgSecondary || undefined,
      textDark: dark?.textPrimary || undefined,
      textSecondaryDark: dark?.textSecondary || undefined,
      borderDark: dark?.border || undefined,
      light: light ? { ...light } : undefined,
      dark: dark ? { ...dark } : undefined
    },
    fonts,
    logoUrl: api.logos?.primary ?? null,
    logos: api.logos,
    borderRadius: api.borderRadius,
    guidelines: api.guidelines,
    whatTheyOffer: '',
    industry: ''
  }
}

// ─── Composable ───────────────────────────────────────────────────────────────

export function useClientApi() {
  const { getAccessTokenSilently } = useAuth0()
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function searchClients(query: string): Promise<ClientInfo[]> {
    loading.value = true
    error.value = null

    try {
      const token = await getAccessTokenSilently()
      const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''
      const response = await fetch(`/.netlify/functions/search-clients${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data: TursoClient[] = await response.json()
      return data.map(mapToClientInfo)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search clients'
      return []
    } finally {
      loading.value = false
    }
  }

  async function getClientById(id: string): Promise<ClientInfo | null> {
    loading.value = true
    error.value = null

    try {
      const token = await getAccessTokenSilently()
      const response = await fetch(`/.netlify/functions/get-client?id=${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data: TursoClient = await response.json()
      return mapToClientInfo(data)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch client'
      return null
    } finally {
      loading.value = false
    }
  }

  async function getBrandKit(clientId: string): Promise<BrandKit | null> {
    loading.value = true
    error.value = null

    try {
      const token = await getAccessTokenSilently()
      const response = await fetch(
        `/.netlify/functions/get-brand-kit?clientId=${encodeURIComponent(clientId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data: { success: boolean; brandKit: ApiBrandKit } = await response.json()
      return mapApiBrandKit(data.brandKit)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch brand kit'
      return null
    } finally {
      loading.value = false
    }
  }

  return { searchClients, getClientById, getBrandKit, loading, error }
}
