import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const { label, sort_order } = await request.json()
  const rows = await query(
    'INSERT INTO poll_options (poll_id, label, sort_order) VALUES ($1,$2,$3) RETURNING *',
    [id, label, sort_order ?? 0]
  )
  return NextResponse.json(rows[0], { status: 201 })
}
