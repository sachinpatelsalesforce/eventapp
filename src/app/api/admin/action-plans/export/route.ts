import { NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { toCSV, csvResponse } from '@/lib/csv'

export async function GET(request: NextRequest) {
  try { await requireAdmin(request) } catch {
    return new Response('Unauthorized', { status: 401 })
  }
  const rows = await query(`
    SELECT c.first_name, c.last_name, c.email, pp.si_name,
           ap.target_account_1, ap.target_account_2, ap.target_account_3,
           ap.joint_play_1, ap.joint_play_2, ap.enablement_need,
           ap.sf_owner_name, ap.follow_up_date, ap.submitted_at
    FROM action_plans ap
    JOIN contacts c ON c.id = ap.contact_id
    LEFT JOIN partner_profiles pp ON pp.contact_id = ap.contact_id
    ORDER BY ap.submitted_at DESC
  `)
  const columns = ['si_name', 'first_name', 'last_name', 'email', 'target_account_1',
    'target_account_2', 'target_account_3', 'joint_play_1', 'joint_play_2',
    'enablement_need', 'sf_owner_name', 'follow_up_date', 'submitted_at']
  return csvResponse(toCSV(rows as never[], columns), 'action-plans.csv')
}
