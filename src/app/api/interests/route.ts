import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  const { contact_id, agenda_item_id, action } = await request.json()

  if (!contact_id || !agenda_item_id) {
    return NextResponse.json({ error: 'contact_id and agenda_item_id required' }, { status: 400 })
  }

  if (action === 'remove') {
    await query('DELETE FROM session_interests WHERE contact_id=$1 AND agenda_item_id=$2', [contact_id, agenda_item_id])
  } else {
    await query(
      `INSERT INTO session_interests (contact_id, agenda_item_id) VALUES ($1,$2)
       ON CONFLICT DO NOTHING`,
      [contact_id, agenda_item_id]
    )
  }

  return NextResponse.json({ ok: true })
}
