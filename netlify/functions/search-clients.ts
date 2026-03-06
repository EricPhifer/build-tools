import 'dotenv/config'
import type { Context } from '@netlify/functions'
import { createClient } from '@libsql/client'

export default async (req: Request, _context: Context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  // Require auth
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers })
  }

  try {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!
    })

    const url = new URL(req.url)
    const query = url.searchParams.get('q')?.trim() || ''

    let result
    if (query) {
      result = await db.execute({
        sql: `SELECT id, name, business_name, email, phone, website, status, project_status,
                     brand_kit, city_region, business_description, notes,
                     ideal_customer, connected_websites,
                     managed_services, health_check_results, health_check_score, health_check_date
              FROM clients
              WHERE (business_name LIKE ? OR name LIKE ? OR email LIKE ?)
                AND status IN ('potential', 'existing', 'prospect')
              ORDER BY business_name ASC
              LIMIT 20`,
        args: [`%${query}%`, `%${query}%`, `%${query}%`]
      })
    } else {
      result = await db.execute({
        sql: `SELECT id, name, business_name, email, phone, website, status, project_status,
                     brand_kit, city_region, business_description, notes,
                     ideal_customer, connected_websites,
                     managed_services, health_check_results, health_check_score, health_check_date
              FROM clients
              WHERE status IN ('potential', 'existing', 'prospect')
              ORDER BY updated_at DESC
              LIMIT 20`,
        args: []
      })
    }

    const clients = result.rows.map(row => {
      let brandKit = null
      if (row.brand_kit && typeof row.brand_kit === 'string') {
        try {
          brandKit = JSON.parse(row.brand_kit)
        } catch {
          // ignore parse errors
        }
      }

      return {
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
    })

    return new Response(JSON.stringify(clients), { status: 200, headers })
  } catch (err) {
    console.error('search-clients error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to search clients' }),
      { status: 500, headers }
    )
  }
}
