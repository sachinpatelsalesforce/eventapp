import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const contactId = searchParams.get('contact_id')
  const category = searchParams.get('category')

  let sql = `
    SELECT gi.*,
           c.first_name || ' ' || c.last_name AS submitter_name,
           COUNT(giv.id) AS vote_count,
           MAX(CASE WHEN giv.contact_id = $1 THEN 1 ELSE 0 END) AS user_voted
    FROM gtm_ideas gi
    JOIN contacts c ON c.id = gi.contact_id
    LEFT JOIN gtm_idea_votes giv ON giv.idea_id = gi.id
    WHERE gi.is_approved = true
  `
  const params: unknown[] = [contactId ?? 0]
  let i = 2

  if (category) { sql += ` AND gi.category = $${i++}`; params.push(category) }

  sql += ' GROUP BY gi.id, c.first_name, c.last_name ORDER BY vote_count DESC, gi.created_at DESC'

  const rows = await query(sql, params)
  return NextResponse.json(rows.map(r => ({ ...r, vote_count: parseInt(String(r.vote_count), 10), user_voted: r.user_voted === 1 || r.user_voted === '1' })))
}

export async function POST(request: NextRequest) {
  const { contact_id, title, category, description } = await request.json()
  if (!contact_id || !title || !category || !description) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }
  const rows = await query(
    `INSERT INTO gtm_ideas (contact_id, title, category, description) VALUES ($1,$2,$3,$4) RETURNING *`,
    [contact_id, title, category, description]
  )
  return NextResponse.json(rows[0], { status: 201 })
}
