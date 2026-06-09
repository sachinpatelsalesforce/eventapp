import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const contactId = searchParams.get('contact_id')
  if (!contactId) return NextResponse.json({ error: 'contact_id required' }, { status: 400 })
  const row = await queryOne('SELECT * FROM action_plans WHERE contact_id = $1', [contactId])
  return NextResponse.json(row ?? null)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const {
    contact_id, target_account_1, target_account_2, target_account_3,
    joint_play_1, joint_play_2, enablement_need, sf_owner_name, follow_up_date
  } = body

  if (!contact_id || !target_account_1 || !joint_play_1 || !enablement_need || !sf_owner_name || !follow_up_date) {
    return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
  }

  const rows = await query(
    `INSERT INTO action_plans
     (contact_id, target_account_1, target_account_2, target_account_3,
      joint_play_1, joint_play_2, enablement_need, sf_owner_name, follow_up_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (contact_id) DO UPDATE SET
       target_account_1=$2, target_account_2=$3, target_account_3=$4,
       joint_play_1=$5, joint_play_2=$6, enablement_need=$7, sf_owner_name=$8,
       follow_up_date=$9, updated_at=NOW()
     RETURNING *`,
    [contact_id, target_account_1, target_account_2 ?? null, target_account_3 ?? null,
     joint_play_1, joint_play_2 ?? null, enablement_need, sf_owner_name, follow_up_date]
  )
  return NextResponse.json(rows[0])
}
