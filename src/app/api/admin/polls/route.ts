import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try { await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const polls = await query('SELECT * FROM polls ORDER BY created_at DESC')
  const enriched = await Promise.all(polls.map(async (poll: Record<string, unknown>) => {
    const options = await query(
      `SELECT po.*, COUNT(pv.id) AS vote_count
       FROM poll_options po LEFT JOIN poll_votes pv ON pv.option_id = po.id
       WHERE po.poll_id = $1 GROUP BY po.id ORDER BY po.sort_order`,
      [poll.id]
    )
    return { ...poll, options }
  }))
  return NextResponse.json(enriched)
}

export async function POST(request: NextRequest) {
  try { await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { question, is_active, options } = await request.json()
  const rows = await query(
    'INSERT INTO polls (question, is_active) VALUES ($1,$2) RETURNING *',
    [question, is_active ?? true]
  )
  const poll = rows[0] as { id: number }

  if (options?.length) {
    for (let i = 0; i < options.length; i++) {
      await query(
        'INSERT INTO poll_options (poll_id, label, sort_order) VALUES ($1,$2,$3)',
        [poll.id, options[i], i]
      )
    }
  }

  return NextResponse.json(poll, { status: 201 })
}
