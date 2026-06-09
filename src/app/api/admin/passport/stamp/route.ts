import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { awardStamp, StampType } from '@/lib/passport'
import { queryOne } from '@/lib/db'

export async function POST(request: NextRequest) {
  let adminPayload: Record<string, unknown>
  try { adminPayload = await requireAdmin(request) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { contact_id, stamp_type } = await request.json()
  const adminUser = await queryOne<{ id: number }>(
    'SELECT id FROM admin_users WHERE username = $1', [adminPayload.username]
  )
  const result = await awardStamp(contact_id, stamp_type as StampType, 'admin', adminUser?.id)
  return NextResponse.json(result)
}
