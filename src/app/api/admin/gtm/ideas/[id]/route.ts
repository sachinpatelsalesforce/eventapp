import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const { is_approved } = await request.json()
  const rows = await query(
    'UPDATE gtm_ideas SET is_approved=$1 WHERE id=$2 RETURNING *', [is_approved, id]
  )
  return NextResponse.json(rows[0])
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  await query('DELETE FROM gtm_ideas WHERE id = $1', [id])
  return NextResponse.json({ ok: true })
}
