import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { queryOne } from '@/lib/db'
import { signToken, setAdminCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { username, password } = await request.json()

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
  }

  const user = await queryOne<{ id: number; username: string; password_hash: string }>(
    'SELECT * FROM admin_users WHERE username = $1',
    [username]
  )

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await signToken({ sub: String(user.id), username: user.username })

  return NextResponse.json({ ok: true }, {
    headers: { 'Set-Cookie': setAdminCookie(token) },
  })
}
