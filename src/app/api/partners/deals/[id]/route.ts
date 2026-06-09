import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

async function verifyOwnership(id: string, contactId: number) {
  const row = await queryOne<{ contact_id: number }>('SELECT contact_id FROM deals WHERE id = $1', [id])
  return row?.contact_id === contactId
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { contact_id, target_account, opportunity_description, blockers, sf_support_needed, next_steps, status } = body

  if (!await verifyOwnership(id, contact_id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const rows = await query(
    `UPDATE deals SET target_account=$1, opportunity_description=$2, blockers=$3,
     sf_support_needed=$4, next_steps=$5, status=$6, updated_at=NOW()
     WHERE id=$7 RETURNING *`,
    [target_account, opportunity_description, blockers ?? null, sf_support_needed ?? null, next_steps ?? null, status, id]
  )
  return NextResponse.json(rows[0])
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { contact_id } = await request.json()
  if (!await verifyOwnership(id, contact_id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  await query('DELETE FROM deals WHERE id = $1', [id])
  return NextResponse.json({ ok: true })
}
