import 'dotenv/config'
import type { Context } from '@netlify/functions'
import { createClient } from '@libsql/client'
import { Resend } from 'resend'

const SECTION_IDS = [
  'your_business', 'services_products', 'your_story',
  'your_customers', 'brand_style', 'practical_details', 'your_goals'
] as const

/** Count non-empty fields across all sections to calculate completion percentage. */
function calculateCompletionPct(data: Record<string, unknown>, requiredSections: string[]): number {
  if (requiredSections.length === 0) return 0

  let completedCount = 0
  for (const sectionId of requiredSections) {
    const section = data[sectionId]
    if (!section || typeof section !== 'object') continue
    const values = Object.values(section as Record<string, unknown>)
    const hasContent = values.some(v => {
      if (Array.isArray(v)) return v.length > 0
      if (typeof v === 'string') return v.trim().length > 0
      return v != null
    })
    if (hasContent) completedCount++
  }

  return Math.round((completedCount / requiredSections.length) * 100)
}

async function sendCompletionEmail(clientId: string, clientName?: string) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL
  if (!adminEmail || !process.env.RESEND_API_KEY) return

  const resend = new Resend(process.env.RESEND_API_KEY)
  const displayName = clientName || clientId

  await resend.emails.send({
    from: 'Phifer Web Solutions <hello@ericphifer.tech>',
    to: [adminEmail],
    subject: `Content Kit completed — ${displayName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="margin: 0 0 8px;">Content Kit Complete</h2>
        <p style="color: #6b7280; margin: 0 0 16px;">
          <strong>${displayName}</strong> has completed all required Content Kit sections.
        </p>
        <p style="color: #6b7280;">
          You can now proceed with the build using their submitted content.
        </p>
      </div>
    `
  })
}

export default async (req: Request, _context: Context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'PUT, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  if (req.method !== 'PUT') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers })
  }

  let body: { clientId?: string; section?: string; data?: Record<string, unknown>; requiredSections?: string[]; completionEmailNotify?: boolean; clientName?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers })
  }

  const { clientId, section, data: sectionData, requiredSections, completionEmailNotify, clientName } = body
  if (!clientId || !section || !sectionData) {
    return new Response(JSON.stringify({ error: 'Missing clientId, section, or data' }), { status: 400, headers })
  }

  if (!SECTION_IDS.includes(section as typeof SECTION_IDS[number])) {
    return new Response(JSON.stringify({ error: `Invalid section: ${section}` }), { status: 400, headers })
  }

  try {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!
    })

    // Fetch existing content kit or create empty
    const existing = await db.execute({
      sql: `SELECT id, data, status FROM content_kits WHERE client_id = ? LIMIT 1`,
      args: [clientId]
    })

    const now = new Date().toISOString()
    let fullData: Record<string, unknown> = {}

    if (existing.rows[0]) {
      // Merge into existing
      const raw = existing.rows[0].data
      if (raw && typeof raw === 'string') {
        try { fullData = JSON.parse(raw) } catch { /* use empty */ }
      }
      fullData[section] = { ...((fullData[section] as Record<string, unknown>) ?? {}), ...sectionData }

      const pct = calculateCompletionPct(fullData, requiredSections ?? SECTION_IDS.map(s => s))
      const status = pct >= 100 ? 'complete' : 'in_progress'

      // Check if this save just completed the kit (was not complete before)
      const prevStatus = existing.rows[0].status as string | undefined
      await db.execute({
        sql: `UPDATE content_kits SET data = ?, status = ?, completion_pct = ?, last_updated_section = ?, updated_at = ? WHERE client_id = ?`,
        args: [JSON.stringify(fullData), status, pct, section, now, clientId]
      })

      // Send completion notification if just completed
      if (status === 'complete' && prevStatus !== 'complete' && completionEmailNotify) {
        await sendCompletionEmail(clientId, clientName)
      }

      return new Response(JSON.stringify({ success: true, completionPct: pct, status }), { status: 200, headers })
    } else {
      // Insert new
      fullData[section] = sectionData
      const pct = calculateCompletionPct(fullData, requiredSections ?? SECTION_IDS.map(s => s))
      const status = pct >= 100 ? 'complete' : 'in_progress'

      await db.execute({
        sql: `INSERT INTO content_kits (id, client_id, data, status, completion_pct, last_updated_section, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [crypto.randomUUID(), clientId, JSON.stringify(fullData), status, pct, section, now, now]
      })

      if (status === 'complete' && completionEmailNotify) {
        await sendCompletionEmail(clientId, clientName)
      }

      return new Response(JSON.stringify({ success: true, completionPct: pct, status }), { status: 201, headers })
    }
  } catch (err) {
    console.error('save-content-kit error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to save content kit' }),
      { status: 500, headers }
    )
  }
}
