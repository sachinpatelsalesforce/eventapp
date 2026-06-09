import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const COOKIE_NAME = 'admin_token'
const EXPIRY = '8h'

function getSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error('NEXTAUTH_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function signToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<Record<string, unknown>> {
  const { payload } = await jwtVerify(token, getSecret())
  return payload as Record<string, unknown>
}

export async function requireAdmin(request: NextRequest): Promise<Record<string, unknown>> {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 })
  }
  try {
    return await verifyToken(token)
  } catch {
    throw Object.assign(new Error('Unauthorized'), { status: 401 })
  }
}

export function setAdminCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${8 * 3600}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
}

export function clearAdminCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`
}

export async function getAdminTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value ?? null
}
