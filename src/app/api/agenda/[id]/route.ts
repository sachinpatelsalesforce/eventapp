import { NextRequest, NextResponse } from 'next/server'
import { queryOne, query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const row = await queryOne(
    `SELECT ai.*, s.name AS speaker_name, s.company AS speaker_company,
            s.photo_url AS speaker_photo, s.bio AS speaker_bio, s.linkedin_url AS speaker_linkedin
     FROM agenda_items ai
     LEFT JOIN speakers s ON s.id = ai.speaker_id
     WHERE ai.id = $1`,
    [id]
  )
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const body = await request.json()
  const { session_title, start_time, end_time, speaker_id, room, description, sort_order, resource_url } = body
  const rows = await query(
    `UPDATE agenda_items SET session_title=$1, start_time=$2, end_time=$3, speaker_id=$4,
     room=$5, description=$6, sort_order=$7, resource_url=$8 WHERE id=$9 RETURNING *`,
    [session_title, start_time, end_time, speaker_id ?? null, room ?? null, description ?? null, sort_order ?? 0, resource_url ?? null, id]
  )
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0])
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  await query('DELETE FROM agenda_items WHERE id = $1', [id])
  return NextResponse.json({ ok: true })
}
