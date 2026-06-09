import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try { await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const rows = await query(`
    SELECT d.*, c.first_name || ' ' || c.last_name AS contact_name, c.email, c.company,
           pp.si_name
    FROM deals d
    JOIN contacts c ON c.id = d.contact_id
    LEFT JOIN partner_profiles pp ON pp.contact_id = d.contact_id
    ORDER BY d.created_at DESC
  `)
  return NextResponse.json(rows)
}
