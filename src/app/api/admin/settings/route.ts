import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try { await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const rows = await query<{ key: string; value: string; label: string; description: string }>(
    'SELECT * FROM app_settings ORDER BY key'
  )
  return NextResponse.json(rows)
}

export async function PUT(request: NextRequest) {
  try { await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const updates = await request.json() as Record<string, boolean>
  for (const [key, value] of Object.entries(updates)) {
    await query('UPDATE app_settings SET value=$1 WHERE key=$2', [value ? 'true' : 'false', key])
  }
  return NextResponse.json({ ok: true })
}
