import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const contactId = searchParams.get('contact_id')

  const polls = await query<{ id: number; question: string; is_active: boolean }>(
    'SELECT * FROM polls WHERE is_active = true ORDER BY created_at DESC'
  )

  const enriched = await Promise.all(polls.map(async poll => {
    const optionRows = await query<{
      id: number; label: string; sort_order: number; vote_count: string; contact_voted_option: number | null
    }>(
      `SELECT po.id, po.label, po.sort_order,
              COUNT(pv.id) AS vote_count,
              MAX(CASE WHEN pv.contact_id = $2 THEN pv.option_id END) AS contact_voted_option
       FROM poll_options po
       LEFT JOIN poll_votes pv ON pv.option_id = po.id AND pv.poll_id = $1
       WHERE po.poll_id = $1
       GROUP BY po.id, po.label, po.sort_order
       ORDER BY po.sort_order`,
      [poll.id, contactId ?? 0]
    )

    const totalVotes = optionRows.reduce((sum, o) => sum + parseInt(String(o.vote_count), 10), 0)
    const contactVotedOption = optionRows.find(o => o.contact_voted_option != null)?.id ?? null

    return {
      ...poll,
      contact_voted: contactVotedOption !== null,
      contact_option_id: contactVotedOption,
      options: optionRows.map(o => ({
        id: o.id,
        label: o.label,
        sort_order: o.sort_order,
        vote_count: parseInt(String(o.vote_count), 10),
        percentage: totalVotes > 0 ? Math.round((parseInt(String(o.vote_count), 10) / totalVotes) * 100) : 0,
      })),
    }
  }))

  return NextResponse.json(enriched)
}
