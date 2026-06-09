import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { Event } from '@/types'
import { EVENT_ID } from '@/lib/constants'

export async function GET() {
  const event = await queryOne<Event>('SELECT * FROM events WHERE id = $1', [EVENT_ID])
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  return NextResponse.json(event)
}
