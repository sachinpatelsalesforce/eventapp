import { NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { toCSV, csvResponse } from '@/lib/csv'

export async function GET(request: NextRequest) {
  try { await requireAdmin(request) } catch {
    return new Response('Unauthorized', { status: 401 })
  }
  const rows = await query(`
    SELECT pp.si_name, pp.partner_tier, pp.capabilities, pp.industries_covered,
           pp.regions_covered, pp.certifications, pp.key_customers,
           pp.sf_ae_name, pp.sf_se_name, pp.marketplace_url, pp.app_exchange_url,
           pp.bio, pp.created_at,
           c.first_name, c.last_name, c.email
    FROM partner_profiles pp
    JOIN contacts c ON c.id = pp.contact_id
    ORDER BY pp.si_name
  `)
  const columns = ['si_name', 'partner_tier', 'capabilities', 'industries_covered', 'regions_covered',
    'certifications', 'key_customers', 'sf_ae_name', 'sf_se_name', 'marketplace_url', 'app_exchange_url',
    'bio', 'first_name', 'last_name', 'email', 'created_at']
  return csvResponse(toCSV(rows as never[], columns), 'partner-profiles.csv')
}
