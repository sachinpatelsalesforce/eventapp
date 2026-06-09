import { NextRequest, NextResponse } from 'next/server'
import { awardStamp, SELF_SERVICE_STAMPS, StampType } from '@/lib/passport'

export async function POST(request: NextRequest) {
  const { contact_id, stamp_type } = await request.json()

  if (!contact_id || !stamp_type) {
    return NextResponse.json({ error: 'contact_id and stamp_type required' }, { status: 400 })
  }

  if (!SELF_SERVICE_STAMPS.includes(stamp_type as StampType)) {
    return NextResponse.json({ error: 'This stamp cannot be self-awarded' }, { status: 403 })
  }

  const result = await awardStamp(contact_id, stamp_type as StampType, 'self')

  if (!result.awarded) {
    return NextResponse.json({ already_stamped: true }, { status: 200 })
  }

  return NextResponse.json({ awarded: true }, { status: 201 })
}
