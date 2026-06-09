import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { EVENT_ID } from '@/lib/constants'

export async function GET() {
  const rows = await query('SELECT * FROM speakers WHERE event_id = $1 ORDER BY name', [EVENT_ID])
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  try { await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json()
  const { name, job_title, company, bio, photo_url, linkedin_url } = body
  const rows = await query(
    `INSERT INTO speakers (event_id, name, job_title, company, bio, photo_url, linkedin_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [EVENT_ID, name, job_title ?? null, company ?? null, bio ?? null,
     photo_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0070d2&color=fff&size=256&bold=true`,
     linkedin_url ?? null]
  )
  return NextResponse.json(rows[0], { status: 201 })
}
