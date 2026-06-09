import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { EVENT_ID } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try { await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const rows = await query(
    'SELECT * FROM contacts WHERE event_id = $1 ORDER BY created_at DESC',
    [EVENT_ID]
  )
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { first_name, last_name, email, company, job_title, consent } = body

  if (!first_name || !last_name || !email) {
    return NextResponse.json({ error: 'first_name, last_name, and email are required' }, { status: 400 })
  }

  const rows = await query(
    `INSERT INTO contacts (event_id, first_name, last_name, email, company, job_title, consent)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (email, event_id)
     DO UPDATE SET first_name=EXCLUDED.first_name, last_name=EXCLUDED.last_name,
                   company=EXCLUDED.company, job_title=EXCLUDED.job_title,
                   consent=EXCLUDED.consent
     RETURNING *, (xmax = 0) AS is_new`,
    [EVENT_ID, first_name, last_name, email, company ?? null, job_title ?? null, consent ?? false]
  )
  return NextResponse.json(rows[0], { status: 200 })
}
