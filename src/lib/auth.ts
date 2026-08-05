import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_session';

function getAdminSecret(): string {
  const secret = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error('ADMIN_SECRET or ADMIN_PASSWORD must be set');
  }
  return secret;
}

export function createAdminToken(): string {
  return createHmac('sha256', getAdminSecret()).update('mobilo-admin').digest('hex');
}

export function verifyAdminToken(token: string): boolean {
  try {
    const expected = createAdminToken();
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function setAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}

export function verifyPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return password === expected;
}
