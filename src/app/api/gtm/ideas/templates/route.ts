import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  const rows = await query('SELECT * FROM gtm_play_templates ORDER BY sort_order')
  return NextResponse.json(rows)
}
