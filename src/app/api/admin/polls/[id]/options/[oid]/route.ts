import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; oid: string }> }) {
  try { await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { oid } = await params
  await query('DELETE FROM poll_options WHERE id = $1', [oid])
  return NextResponse.json({ ok: true })
}
