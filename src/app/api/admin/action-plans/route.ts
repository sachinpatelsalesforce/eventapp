import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try { await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const rows = await query(`
    SELECT ap.*, c.first_name || ' ' || c.last_name AS contact_name, c.email,
           pp.si_name
    FROM action_plans ap
    JOIN contacts c ON c.id = ap.contact_id
    LEFT JOIN partner_profiles pp ON pp.contact_id = ap.contact_id
    ORDER BY ap.submitted_at DESC
  `)
  return NextResponse.json(rows)
}
