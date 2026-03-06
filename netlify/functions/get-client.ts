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
  const id = url.searchParams.get('id')?.trim()
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id param' }), { status: 400, headers })
  }

  try {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!
    })

    const result = await db.execute({
      sql: `SELECT id, name, business_name, email, phone, website, status, project_status,
                   brand_kit, city_region, business_description, notes,
                   ideal_customer, connected_websites,
                   managed_services, health_check_results, health_check_score, health_check_date
            FROM clients
            WHERE id = ?
            LIMIT 1`,
      args: [id]
    })

    const row = result.rows[0]
    if (!row) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers })
    }

    let brandKit = null
    if (row.brand_kit && typeof row.brand_kit === 'string') {
      try { brandKit = JSON.parse(row.brand_kit) } catch { /* ignore */ }
    }

    const client = {
      id: row.id,
      name: row.name,
      businessName: row.business_name,
      email: row.email,
      phone: row.phone,
      website: row.website,
      status: row.status,
      projectStatus: row.project_status,
      brandKit,
      cityRegion: row.city_region,
      businessDescription: row.business_description,
      notes: row.notes,
      idealCustomer: row.ideal_customer,
      connectedWebsites: row.connected_websites,
      managedServices: row.managed_services,
      healthCheckResults: row.health_check_results,
      healthCheckScore: row.health_check_score,
      healthCheckDate: row.health_check_date
    }

    return new Response(JSON.stringify(client), { status: 200, headers })
  } catch (err) {
    console.error('get-client error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch client' }),
      { status: 500, headers }
    )
  }
}
