import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const { question, is_active } = await request.json()
  const rows = await query(
    'UPDATE polls SET question=$1, is_active=$2 WHERE id=$3 RETURNING *',
    [question, is_active, id]
  )
  return NextResponse.json(rows[0])
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  await query('DELETE FROM polls WHERE id = $1', [id])
  return NextResponse.json({ ok: true })
}
