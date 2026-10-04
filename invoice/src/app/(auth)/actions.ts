'use server';

import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/lib/db';
import { endSession, isOwnerEmail, startSession } from '@/lib/auth';
import { appUrl, sendEmail } from '@/lib/email/send';
import { noticeEmail } from '@/lib/email/templates';

export type FormState = { error?: string; ok?: string } | undefined;

const email = z.string().trim().toLowerCase().email('Enter a valid email');
const password = z.string().min(8, 'Password must be at least 8 characters').max(200);

function safeNext(next: FormDataEntryValue | null) {
  const n = typeof next === 'string' ? next : '';
  return n.startsWith('/') && !n.startsWith('//') ? n : '/dashboard';
}

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = z.object({ email, password: z.string().min(1) }).safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: 'Enter your email and password' };
  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const valid = user && (await bcrypt.compare(parsed.data.password, user.passwordHash));
  if (!user || !valid) return { error: 'Wrong email or password' };
  if (!user.active) return { error: 'This account has been deactivated' };
  await startSession(user.id);
  redirect(safeNext(fd.get('next')));
}

export async function signup(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = z
    .object({
      name: z.string().trim().min(1, 'Enter your name').max(120),
      email,
      password,
      code: z.string().optional(),
    })
    .safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const v = parsed.data;

  const owner = isOwnerEmail(v.email);
  const requiredCode = process.env.SIGNUP_CODE;
  if (!owner && requiredCode && v.code?.trim() !== requiredCode) return { error: 'That invite code is not valid' };

  if (await db.user.findUnique({ where: { email: v.email } })) return { error: 'An account with that email already exists' };

  const user = await db.user.create({
    data: {
      name: v.name,
      email: v.email,
      passwordHash: await bcrypt.hash(v.password, 11),
      role: owner ? 'OWNER' : 'FREELANCER',
    },
  });
  await startSession(user.id);
  redirect('/settings?welcome=1');
}

export async function logout() {
  await endSession();
  redirect('/login');
}

const hashToken = (t: string) => createHash('sha256').update(t).digest('hex');

export async function forgotPassword(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = email.safeParse(fd.get('email'));
  if (!parsed.success) return { error: 'Enter a valid email' };
  const user = await db.user.findUnique({ where: { email: parsed.data } });
  if (user?.active) {
    const token = randomBytes(32).toString('base64url');
    await db.passwordReset.create({
      data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    const mail = noticeEmail({
      eyebrow: 'Password reset',
      title: 'Reset your password',
      intro: 'Someone asked to reset the password for your account. The link below works for one hour. If it was not you, ignore this email.',
      cta: { label: 'Choose a new password', href: appUrl(`/reset/${token}`) },
    });
    await sendEmail({ to: user.email, ...mail });
  }
  // Same response either way so emails can't be probed.
  return { ok: 'If that email has an account, a reset link is on its way.' };
}

export async function resetPassword(_: FormState, fd: FormData): Promise<FormState> {
  const token = String(fd.get('token') ?? '');
  const parsed = password.safeParse(fd.get('password'));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const reset = await db.passwordReset.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!reset || reset.usedAt || reset.expiresAt < new Date()) return { error: 'This reset link has expired. Request a new one.' };
  await db.$transaction([
    db.user.update({ where: { id: reset.userId }, data: { passwordHash: await bcrypt.hash(parsed.data, 11) } }),
    db.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
  ]);
  await startSession(reset.userId);
  redirect('/dashboard');
}
