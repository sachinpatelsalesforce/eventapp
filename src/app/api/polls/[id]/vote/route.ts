import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { contact_id, option_id } = await request.json()

  if (!contact_id || !option_id) {
    return NextResponse.json({ error: 'contact_id and option_id required' }, { status: 400 })
  }

  // upsert vote (change vote if already voted)
  await query(
    `INSERT INTO poll_votes (poll_id, option_id, contact_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (poll_id, contact_id) DO UPDATE SET option_id = $2, voted_at = NOW()`,
    [id, option_id, contact_id]
  )

  // return updated counts
  const optionRows = await query<{ id: number; label: string; vote_count: string }>(
    `SELECT po.id, po.label, COUNT(pv.id) AS vote_count
     FROM poll_options po
     LEFT JOIN poll_votes pv ON pv.option_id = po.id
     WHERE po.poll_id = $1
     GROUP BY po.id, po.label
     ORDER BY po.sort_order`,
    [id]
  )
  const total = optionRows.reduce((s, o) => s + parseInt(String(o.vote_count), 10), 0)
  return NextResponse.json({
    options: optionRows.map(o => ({
      id: o.id,
      label: o.label,
      vote_count: parseInt(String(o.vote_count), 10),
      percentage: total > 0 ? Math.round((parseInt(String(o.vote_count), 10) / total) * 100) : 0,
    })),
  })
}
