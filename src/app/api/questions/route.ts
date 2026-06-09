import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { EVENT_ID } from '@/lib/constants'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const topic = searchParams.get('topic')
  const sessionId = searchParams.get('session_id')

  let sql = `
    SELECT q.*, c.first_name || ' ' || c.last_name AS contact_name,
           ai.session_title
    FROM questions q
    JOIN contacts c ON c.id = q.contact_id
    JOIN agenda_items ai ON ai.id = q.session_id
    WHERE c.event_id = $1
  `
  const params: unknown[] = [EVENT_ID]
  let i = 2

  if (topic) { sql += ` AND q.topic = $${i++}`; params.push(topic) }
  if (sessionId) { sql += ` AND q.session_id = $${i++}`; params.push(sessionId) }

  sql += ' ORDER BY q.submitted_at DESC'

  const rows = await query(sql, params)
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { contact_id, session_id, question_text, topic } = body

  if (!contact_id || !session_id || !question_text) {
    return NextResponse.json({ error: 'contact_id, session_id, and question_text are required' }, { status: 400 })
  }

  const rows = await query(
    `INSERT INTO questions (contact_id, session_id, question_text, topic)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [contact_id, session_id, question_text, topic ?? null]
  )
  return NextResponse.json(rows[0], { status: 201 })
}
