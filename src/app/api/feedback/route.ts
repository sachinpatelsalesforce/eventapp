import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { awardStamp } from '@/lib/passport'
import { EVENT_ID } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try { await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const rows = await query(`
    SELECT f.*, c.first_name || ' ' || c.last_name AS contact_name, c.email
    FROM feedback f
    JOIN contacts c ON c.id = f.contact_id
    WHERE f.event_id = $1
    ORDER BY f.submitted_at DESC
  `, [EVENT_ID])
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { contact_id, rating, enjoyed, improve, future_topics } = body

  if (!contact_id || !rating) {
    return NextResponse.json({ error: 'contact_id and rating are required' }, { status: 400 })
  }

  const rows = await query(
    `INSERT INTO feedback (contact_id, event_id, rating, enjoyed, improve, future_topics)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [contact_id, EVENT_ID, rating, enjoyed ?? null, improve ?? null, future_topics ?? null]
  )

  // auto-award passport stamp
  await awardStamp(contact_id, 'feedback_form', 'system').catch(() => {})

  return NextResponse.json(rows[0], { status: 201 })
}
