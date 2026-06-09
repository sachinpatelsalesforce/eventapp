import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const contactId = searchParams.get('contact_id')
  if (!contactId) return NextResponse.json({ error: 'contact_id required' }, { status: 400 })
  const rows = await query(
    'SELECT * FROM passport_stamps WHERE contact_id = $1 ORDER BY stamped_at ASC', [contactId]
  )
  return NextResponse.json(rows)
}
