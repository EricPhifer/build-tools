import 'dotenv/config'
import type { Context } from '@netlify/functions'
import { createClient } from '@libsql/client'

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
      sql: `SELECT data, status, completion_pct, updated_at FROM content_kits WHERE client_id = ? LIMIT 1`,
      args: [clientId]
    })

    const row = result.rows[0]
    if (!row) {
      return new Response(JSON.stringify({
        success: true,
        contentKit: null,
        status: 'not_started',
        completionPct: 0
      }), { status: 200, headers })
    }

    let data = {}
    if (row.data && typeof row.data === 'string') {
      try { data = JSON.parse(row.data) } catch { /* use empty */ }
    }

    return new Response(JSON.stringify({
      success: true,
      contentKit: data,
      status: row.status ?? 'not_started',
      completionPct: row.completion_pct ?? 0,
      updatedAt: row.updated_at ?? null
    }), { status: 200, headers })
  } catch (err) {
    console.error('get-content-kit error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch content kit' }),
      { status: 500, headers }
    )
  }
}
