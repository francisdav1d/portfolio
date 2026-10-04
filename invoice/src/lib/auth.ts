import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { db } from './db';
import { SESSION_COOKIE, sessionCookieOptions, signSession, verifySession } from './session';

export async function startSession(userId: string) {
  const token = await signSession(userId);
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export const getCurrentUser = cache(async () => {
  const userId = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || !user.active) return null;
  return user;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireOwner() {
  const user = await requireUser();
  if (user.role !== 'OWNER') redirect('/dashboard');
  return user;
}

export function isOwnerEmail(email: string) {
  const owner = process.env.OWNER_EMAIL?.trim().toLowerCase();
  return !!owner && owner === email.trim().toLowerCase();
}
