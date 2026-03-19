import 'dotenv/config'
import type { Context } from '@netlify/functions'
import { createClient } from '@libsql/client'
import { Resend } from 'resend'

export default async (req: Request, _context: Context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers })
  }

  let body: { clientId?: string; clientEmail?: string; clientName?: string; dashboardUrl?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers })
  }

  const { clientId, clientEmail, clientName, dashboardUrl } = body
  if (!clientId || !clientEmail || !clientName) {
    return new Response(JSON.stringify({ error: 'Missing clientId, clientEmail, or clientName' }), { status: 400, headers })
  }

  try {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!
    })

    // Fetch current content kit status
    const result = await db.execute({
      sql: `SELECT data, status, completion_pct FROM content_kits WHERE client_id = ? LIMIT 1`,
      args: [clientId]
    })

    const row = result.rows[0]
    const completionPct = row ? (row.completion_pct as number ?? 0) : 0
    const status = row ? (row.status as string ?? 'not_started') : 'not_started'

    let sectionSummary = ''
    if (row?.data && typeof row.data === 'string') {
      try {
        const data = JSON.parse(row.data as string)
        const sections = [
          { id: 'your_business', label: 'Your Business' },
          { id: 'services_products', label: 'Services / Products' },
          { id: 'your_story', label: 'Your Story' },
          { id: 'your_customers', label: 'Your Customers' },
          { id: 'brand_style', label: 'Brand & Style' },
          { id: 'practical_details', label: 'Practical Details' },
          { id: 'your_goals', label: 'Your Goals' }
        ]
        sectionSummary = sections.map(s => {
          const hasData = data[s.id] && Object.values(data[s.id]).some((v: unknown) =>
            Array.isArray(v) ? v.length > 0 : typeof v === 'string' ? v.trim().length > 0 : v != null
          )
          return `${hasData ? '✅' : '⬜'} ${s.label}`
        }).join('\n')
      } catch { /* ignore */ }
    } else {
      sectionSummary = [
        '⬜ Your Business', '⬜ Services / Products', '⬜ Your Story',
        '⬜ Your Customers', '⬜ Brand & Style', '⬜ Practical Details', '⬜ Your Goals'
      ].join('\n')
    }

    const contentKitUrl = dashboardUrl
      ? `${dashboardUrl}/content-kit`
      : '#'

    const resend = new Resend(process.env.RESEND_API_KEY!)

    await resend.emails.send({
      from: 'Phifer Web Solutions <hello@ericphifer.tech>',
      to: [clientEmail],
      subject: `${clientName} — Your Content Kit is waiting`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
          <h2 style="margin: 0 0 8px;">Hi ${clientName}!</h2>
          <p style="color: #6b7280; margin: 0 0 24px;">
            We're getting ready to build your website and need some information from you.
            Your Content Kit is ${status === 'not_started' ? 'ready to be filled out' : `${completionPct}% complete`}.
          </p>

          <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px;">Section Progress</p>
            <pre style="font-family: inherit; font-size: 14px; line-height: 1.8; margin: 0; white-space: pre-wrap;">${sectionSummary}</pre>
          </div>

          <a href="${contentKitUrl}" style="display: inline-block; background: #4f46e5; color: #fff; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px; text-decoration: none;">
            Open Content Kit
          </a>

          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
            The more detail you provide, the better we can tailor your website to your business.
            Don't worry about getting everything perfect — you can always come back and update later.
          </p>

          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            — The Phifer Web Solutions Team
          </p>
        </div>
      `
    })

    // Also notify admin
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL
    if (adminEmail) {
      await resend.emails.send({
        from: 'Phifer Web Solutions <hello@ericphifer.tech>',
        to: [adminEmail],
        subject: `Content Kit reminder sent to ${clientName}`,
        html: `<p>A Content Kit reminder email was sent to <strong>${clientName}</strong> (${clientEmail}).</p>
               <p>Current status: ${status} (${completionPct}%)</p>`
      })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers })
  } catch (err) {
    console.error('send-content-kit-reminder error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to send reminder' }),
      { status: 500, headers }
    )
  }
}
