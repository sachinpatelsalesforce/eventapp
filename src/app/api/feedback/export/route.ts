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
    SELECT f.id, f.rating, f.enjoyed, f.improve, f.future_topics, f.submitted_at,
           c.first_name, c.last_name, c.email, c.company
    FROM feedback f
    JOIN contacts c ON c.id = f.contact_id
    WHERE f.event_id = $1
    ORDER BY f.submitted_at DESC
  `, [EVENT_ID])
  const columns = ['id', 'rating', 'enjoyed', 'improve', 'future_topics', 'first_name', 'last_name', 'email', 'company', 'submitted_at']
  return csvResponse(toCSV(rows as never[], columns), 'feedback.csv')
}
