import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try { await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const rows = await query(`
    SELECT ps.*, c.first_name || ' ' || c.last_name AS contact_name, c.email
    FROM passport_stamps ps
    JOIN contacts c ON c.id = ps.contact_id
    ORDER BY ps.stamped_at DESC
  `)
  return NextResponse.json(rows)
}
