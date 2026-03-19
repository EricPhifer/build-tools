import 'dotenv/config'
import type { Context } from '@netlify/functions'
import { getStore } from '@netlify/blobs'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default async (req: Request, context: Context) => {
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

  try {
    const formData = await req.formData()
    const clientId = formData.get('clientId') as string | null
    const section = formData.get('section') as string | null
    const file = formData.get('file') as File | null

    if (!clientId || !section || !file) {
      return new Response(JSON.stringify({ error: 'Missing clientId, section, or file' }), { status: 400, headers })
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ error: 'File too large (max 5MB)' }), { status: 413, headers })
    }

    const store = getStore({ name: 'content-kit-assets', siteID: context.site.id!, token: process.env.NETLIFY_BLOBS_TOKEN })
    const key = `${clientId}/${section}/${file.name}`
    const buffer = await file.arrayBuffer()

    await store.set(key, new Uint8Array(buffer), {
      metadata: {
        contentType: file.type,
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    })

    const url = await store.get(key, { type: 'blob' })
      ? `/.netlify/blobs/content-kit-assets/${key}`
      : key

    return new Response(JSON.stringify({ success: true, key, url }), { status: 200, headers })
  } catch (err) {
    console.error('upload-content-kit-file error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to upload file' }),
      { status: 500, headers }
    )
  }
}
