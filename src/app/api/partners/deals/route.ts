import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const contactId = searchParams.get('contact_id')
  if (!contactId) return NextResponse.json({ error: 'contact_id required' }, { status: 400 })
  const rows = await query(
    'SELECT * FROM deals WHERE contact_id = $1 ORDER BY created_at DESC', [contactId]
  )
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { contact_id, target_account, opportunity_description, blockers, sf_support_needed, next_steps, status } = body
  if (!contact_id || !target_account || !opportunity_description) {
    return NextResponse.json({ error: 'contact_id, target_account, and opportunity_description required' }, { status: 400 })
  }
  const rows = await query(
    `INSERT INTO deals (contact_id, target_account, opportunity_description, blockers, sf_support_needed, next_steps, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [contact_id, target_account, opportunity_description, blockers ?? null, sf_support_needed ?? null, next_steps ?? null, status ?? 'active']
  )
  return NextResponse.json(rows[0], { status: 201 })
}
