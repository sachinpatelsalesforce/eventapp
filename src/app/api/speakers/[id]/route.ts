import { NextRequest, NextResponse } from 'next/server'
import { queryOne, query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const row = await queryOne('SELECT * FROM speakers WHERE id = $1', [id])
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const { name, job_title, company, bio, photo_url, linkedin_url } = await request.json()
  const rows = await query(
    `UPDATE speakers SET name=$1, job_title=$2, company=$3, bio=$4, photo_url=$5, linkedin_url=$6
     WHERE id=$7 RETURNING *`,
    [name, job_title ?? null, company ?? null, bio ?? null, photo_url ?? null, linkedin_url ?? null, id]
  )
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0])
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  await query('DELETE FROM speakers WHERE id = $1', [id])
  return NextResponse.json({ ok: true })
}
