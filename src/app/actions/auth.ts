'use server';

import { setAdminSession, clearAdminSession, verifyPassword } from '@/lib/auth';

export type AuthResult = { success: true } | { success: false; error: string };

export async function loginAdmin(password: string): Promise<AuthResult> {
  if (!verifyPassword(password)) {
    return { success: false, error: 'Contraseña incorrecta' };
  }
  await setAdminSession();
  return { success: true };
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
}

export async function checkAdminAuth(): Promise<boolean> {
  const { isAdminAuthenticated } = await import('@/lib/auth');
  return isAdminAuthenticated();
}
