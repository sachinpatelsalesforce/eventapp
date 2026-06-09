import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const capability = searchParams.get('capability')
  const industry = searchParams.get('industry')
  const region = searchParams.get('region')
  const tier = searchParams.get('tier')

  let sql = `
    SELECT pp.*, c.first_name AS contact_first_name, c.last_name AS contact_last_name, c.email AS contact_email
    FROM partner_profiles pp
    JOIN contacts c ON c.id = pp.contact_id
    WHERE 1=1
  `
  const params: unknown[] = []
  let i = 1

  if (capability) { sql += ` AND $${i++} = ANY(pp.capabilities)`; params.push(capability) }
  if (industry) { sql += ` AND $${i++} = ANY(pp.industries_covered)`; params.push(industry) }
  if (region) { sql += ` AND $${i++} = ANY(pp.regions_covered)`; params.push(region) }
  if (tier) { sql += ` AND pp.partner_tier = $${i++}`; params.push(tier) }

  sql += ' ORDER BY pp.partner_tier, pp.si_name'

  const rows = await query(sql, params)
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const {
    contact_id, si_name, partner_tier, commerce_specialisms, industries_covered,
    certifications, key_customers, sf_ae_name, sf_se_name, marketplace_url,
    app_exchange_url, regions_covered, capabilities, bio, logo_url
  } = body

  if (!contact_id || !si_name || !partner_tier) {
    return NextResponse.json({ error: 'contact_id, si_name, and partner_tier are required' }, { status: 400 })
  }

  const rows = await query(
    `INSERT INTO partner_profiles
     (contact_id, si_name, partner_tier, commerce_specialisms, industries_covered, certifications,
      key_customers, sf_ae_name, sf_se_name, marketplace_url, app_exchange_url, regions_covered,
      capabilities, bio, logo_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING *`,
    [contact_id, si_name, partner_tier,
     commerce_specialisms ?? [], industries_covered ?? [], certifications ?? [],
     key_customers ?? [], sf_ae_name ?? null, sf_se_name ?? null,
     marketplace_url ?? null, app_exchange_url ?? null, regions_covered ?? [],
     capabilities ?? [], bio ?? null, logo_url ?? null]
  )
  return NextResponse.json(rows[0], { status: 201 })
}
