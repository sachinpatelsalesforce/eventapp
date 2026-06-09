import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { EVENT_ID } from '@/lib/constants'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const partnerType = searchParams.get('partner_type')

  let sql = `
    SELECT
      ai.*,
      s.name AS speaker_name,
      s.company AS speaker_company,
      s.photo_url AS speaker_photo,
      COALESCE(
        ARRAY_AGG(spt.partner_type) FILTER (WHERE spt.partner_type IS NOT NULL),
        '{}'
      ) AS partner_types
    FROM agenda_items ai
    LEFT JOIN speakers s ON s.id = ai.speaker_id
    LEFT JOIN session_partner_tags spt ON spt.agenda_item_id = ai.id
    WHERE ai.event_id = $1
  `
  const params: unknown[] = [EVENT_ID]

  if (partnerType) {
    sql += `
      AND ai.id IN (
        SELECT agenda_item_id FROM session_partner_tags WHERE partner_type = $2
      )
    `
    params.push(partnerType)
  }

  sql += ' GROUP BY ai.id, s.name, s.company, s.photo_url ORDER BY ai.sort_order, ai.start_time'

  const rows = await query(sql, params)
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { session_title, start_time, end_time, speaker_id, room, description, sort_order, resource_url } = body

  const rows = await query(
    `INSERT INTO agenda_items (event_id, session_title, start_time, end_time, speaker_id, room, description, sort_order, resource_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [EVENT_ID, session_title, start_time, end_time, speaker_id ?? null, room ?? null, description ?? null, sort_order ?? 0, resource_url ?? null]
  )
  return NextResponse.json(rows[0], { status: 201 })
}
