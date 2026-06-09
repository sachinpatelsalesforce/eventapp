import { query } from './db'
import type { StampType } from './passport-constants'

export type { StampType } from './passport-constants'
export { SELF_SERVICE_STAMPS, STAMP_LABELS, STAMP_ICONS } from './passport-constants'

export async function awardStamp(
  contactId: number,
  stampType: StampType,
  awardedBy: 'self' | 'admin' | 'system',
  adminId?: number
): Promise<{ awarded: boolean }> {
  const rows = await query(
    `INSERT INTO passport_stamps (contact_id, stamp_type, awarded_by, admin_id)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (contact_id, stamp_type) DO NOTHING
     RETURNING id`,
    [contactId, stampType, awardedBy, adminId ?? null]
  )
  return { awarded: rows.length > 0 }
}
