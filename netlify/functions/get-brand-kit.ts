import 'dotenv/config'
import type { Context } from '@netlify/functions'
import { createClient } from '@libsql/client'

type ColorMap = Record<string, string | undefined>

interface ApiBrandKit {
  colors: {
    primary: string
    secondary: string
    accent: string
    light?: ColorMap
    dark?: ColorMap
  }
  fonts?: {
    heading?: { name: string; importUrl?: string; weights?: number[] }
    body?: { name: string; importUrl?: string; weights?: number[] }
  }
  logos?: { primary?: string; dark?: string; favicon?: string }
  borderRadius?: string
  guidelines?: { voice?: string; usage?: string; notes?: string }
}

function migrateBrandKit(raw: Record<string, unknown>): ApiBrandKit {
  // Already in new format
  if (raw.colors && typeof raw.colors === 'object' && !Array.isArray(raw.colors)) {
    const colors = raw.colors as Record<string, unknown>
    if (colors.light !== undefined || colors.dark !== undefined || colors.primary !== undefined) {
      return raw as unknown as ApiBrandKit
    }
  }

  // Legacy format: flat primaryColor/lightColors/darkColors
  const light = (raw.lightColors ?? {}) as ColorMap
  const dark = (raw.darkColors ?? {}) as ColorMap

  const primary = light.primary ?? (raw.primaryColor as string) ?? '#2D6A4F'
  const secondary = light.secondary ?? (raw.secondaryColor as string) ?? '#40916C'
  const accent = light.accent ?? (raw.accentColor as string) ?? '#95D5B2'

  let fonts: ApiBrandKit['fonts'] = undefined
  if (raw.fonts && typeof raw.fonts === 'string') {
    const parts = raw.fonts.split(',').map(f => f.trim()).filter(Boolean)
    fonts = {
      heading: parts[0] ? { name: parts[0] } : undefined,
      body: parts.length >= 2 ? { name: parts[1] } : (parts[0] ? { name: parts[0] } : undefined)
    }
  }

  let guidelines: ApiBrandKit['guidelines'] = undefined
  if (raw.guidelines && typeof raw.guidelines === 'string') {
    guidelines = { notes: raw.guidelines }
  } else if (raw.guidelines && typeof raw.guidelines === 'object') {
    guidelines = raw.guidelines as ApiBrandKit['guidelines']
  }

  return {
    colors: {
      primary,
      secondary,
      accent,
      light: Object.keys(light).length > 0 ? light : undefined,
      dark: Object.keys(dark).length > 0 ? dark : undefined
    },
    fonts,
    logos: raw.logoUrl ? { primary: raw.logoUrl as string } : undefined,
    borderRadius: raw.borderRadius as string | undefined,
    guidelines
  }
}

export default async (req: Request, _context: Context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers })
  }

  const url = new URL(req.url)
  const clientId = url.searchParams.get('clientId')?.trim()
  if (!clientId) {
    return new Response(JSON.stringify({ error: 'Missing clientId param' }), { status: 400, headers })
  }

  try {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!
    })

    const result = await db.execute({
      sql: `SELECT brand_kit FROM clients WHERE id = ? LIMIT 1`,
      args: [clientId]
    })

    const row = result.rows[0]
    if (!row) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers })
    }

    let raw: Record<string, unknown> = {}
    if (row.brand_kit && typeof row.brand_kit === 'string') {
      try { raw = JSON.parse(row.brand_kit) } catch { /* use empty */ }
    }

    const brandKit = migrateBrandKit(raw)
    return new Response(JSON.stringify({ success: true, brandKit }), { status: 200, headers })
  } catch (err) {
    console.error('get-brand-kit error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch brand kit' }),
      { status: 500, headers }
    )
  }
}
