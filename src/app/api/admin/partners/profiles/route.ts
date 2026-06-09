import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try { await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const rows = await query(`
    SELECT pp.*, c.first_name, c.last_name, c.email
    FROM partner_profiles pp
    JOIN contacts c ON c.id = pp.contact_id
    ORDER BY pp.partner_tier, pp.si_name
  `)
  return NextResponse.json(rows)
}
