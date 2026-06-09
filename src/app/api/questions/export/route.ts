import { NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { toCSV, csvResponse } from '@/lib/csv'
import { EVENT_ID } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try { await requireAdmin(request) } catch {
    return new Response('Unauthorized', { status: 401 })
  }
  const rows = await query(`
    SELECT q.id, q.question_text, q.topic, q.submitted_at,
           c.first_name, c.last_name, c.email, ai.session_title
    FROM questions q
    JOIN contacts c ON c.id = q.contact_id
    JOIN agenda_items ai ON ai.id = q.session_id
    WHERE c.event_id = $1
    ORDER BY q.submitted_at DESC
  `, [EVENT_ID])
  const columns = ['id', 'question_text', 'topic', 'session_title', 'first_name', 'last_name', 'email', 'submitted_at']
  return csvResponse(toCSV(rows as never[], columns), 'questions.csv')
}
