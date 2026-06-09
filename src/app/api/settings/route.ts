import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function GET() {
  const rows = await query<{ key: string; value: string }>('SELECT key, value FROM app_settings')
  const settings: Record<string, boolean> = {}
  for (const row of rows) {
    settings[row.key] = row.value === 'true'
  }
  return NextResponse.json(settings)
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as Record<string, boolean>

  for (const [key, value] of Object.entries(body)) {
    await query(
      'UPDATE app_settings SET value = $1 WHERE key = $2',
      [value ? 'true' : 'false', key]
    )
  }

  return NextResponse.json({ ok: true })
}
