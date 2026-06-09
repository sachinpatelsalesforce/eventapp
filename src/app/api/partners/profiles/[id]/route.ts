import { NextRequest, NextResponse } from 'next/server'
import { queryOne, query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const row = await queryOne(
    `SELECT pp.*, c.first_name, c.last_name, c.email
     FROM partner_profiles pp JOIN contacts c ON c.id = pp.contact_id
     WHERE pp.id = $1`, [id]
  )
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { contact_id, ...fields } = body

  // verify ownership (admin bypasses)
  let isAdmin = false
  try { await requireAdmin(request); isAdmin = true } catch { /* not admin */ }

  if (!isAdmin) {
    const existing = await queryOne<{ contact_id: number }>(
      'SELECT contact_id FROM partner_profiles WHERE id = $1', [id]
    )
    if (!existing || existing.contact_id !== contact_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const {
    si_name, partner_tier, commerce_specialisms, industries_covered, certifications,
    key_customers, sf_ae_name, sf_se_name, marketplace_url, app_exchange_url,
    regions_covered, capabilities, bio, logo_url
  } = fields

  const rows = await query(
    `UPDATE partner_profiles SET
     si_name=$1, partner_tier=$2, commerce_specialisms=$3, industries_covered=$4,
     certifications=$5, key_customers=$6, sf_ae_name=$7, sf_se_name=$8,
     marketplace_url=$9, app_exchange_url=$10, regions_covered=$11, capabilities=$12,
     bio=$13, logo_url=$14, updated_at=NOW()
     WHERE id=$15 RETURNING *`,
    [si_name, partner_tier, commerce_specialisms ?? [], industries_covered ?? [],
     certifications ?? [], key_customers ?? [], sf_ae_name ?? null, sf_se_name ?? null,
     marketplace_url ?? null, app_exchange_url ?? null, regions_covered ?? [],
     capabilities ?? [], bio ?? null, logo_url ?? null, id]
  )
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0])
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  await query('DELETE FROM partner_profiles WHERE id = $1', [id])
  return NextResponse.json({ ok: true })
}
