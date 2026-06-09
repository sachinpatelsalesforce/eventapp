import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try { await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { agenda_item_id, partner_type } = await request.json()
  const rows = await query(
    `INSERT INTO session_partner_tags (agenda_item_id, partner_type)
     VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING *`,
    [agenda_item_id, partner_type]
  )
  return NextResponse.json(rows[0] ?? { ok: true })
}
