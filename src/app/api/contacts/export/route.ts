import { NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { toCSV, csvResponse } from '@/lib/csv'
import { EVENT_ID } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try { await requireAdmin(request) } catch {
    return new Response('Unauthorized', { status: 401 })
  }
  const rows = await query(
    'SELECT * FROM contacts WHERE event_id = $1 ORDER BY created_at DESC',
    [EVENT_ID]
  )
  const columns = ['id', 'first_name', 'last_name', 'email', 'company', 'job_title', 'consent', 'created_at']
  return csvResponse(toCSV(rows as never[], columns), 'contacts.csv')
}
