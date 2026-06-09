import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { contact_id } = await request.json()

  if (!contact_id) return NextResponse.json({ error: 'contact_id required' }, { status: 400 })

  const existing = await queryOne(
    'SELECT id FROM gtm_idea_votes WHERE idea_id = $1 AND contact_id = $2', [id, contact_id]
  )

  if (existing) {
    await query('DELETE FROM gtm_idea_votes WHERE idea_id = $1 AND contact_id = $2', [id, contact_id])
    const [{ vote_count }] = await query<{ vote_count: string }>(
      'SELECT COUNT(*) AS vote_count FROM gtm_idea_votes WHERE idea_id = $1', [id]
    )
    return NextResponse.json({ voted: false, vote_count: parseInt(vote_count, 10) })
  } else {
    await query(
      'INSERT INTO gtm_idea_votes (idea_id, contact_id) VALUES ($1,$2)', [id, contact_id]
    )
    const [{ vote_count }] = await query<{ vote_count: string }>(
      'SELECT COUNT(*) AS vote_count FROM gtm_idea_votes WHERE idea_id = $1', [id]
    )
    return NextResponse.json({ voted: true, vote_count: parseInt(vote_count, 10) })
  }
}
