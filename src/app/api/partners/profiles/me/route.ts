import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const contactId = searchParams.get('contact_id')
  if (!contactId) return NextResponse.json({ error: 'contact_id required' }, { status: 400 })

  const row = await queryOne(
    'SELECT * FROM partner_profiles WHERE contact_id = $1', [contactId]
  )
  if (!row) return NextResponse.json(null, { status: 200 })
  return NextResponse.json(row)
}
