'use server';

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import type { FormState } from '../../(auth)/actions';

const opt = z
  .string()
  .trim()
  .max(500)
  .transform((s) => s || null)
  .nullable()
  .optional();

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  businessName: opt,
  address: opt,
  phone: opt,
  taxId: opt,
  bankName: opt,
  bankAccountName: opt,
  bankAccountNumber: opt,
  bankRouting: opt,
  bankSwift: opt,
  bankAddress: opt,
  wiseEmail: opt,
  paypalEmail: opt,
  paymentNotes: opt,
  defaultCurrency: z.string().length(3),
  invoicePrefix: z
    .string()
    .trim()
    .min(1)
    .max(12)
    .regex(/^[A-Za-z0-9-]+$/, 'Prefix can only use letters, numbers and dashes'),
  nextInvoiceNumber: z.coerce.number().int().min(1).max(999_999),
  defaultDueDays: z.coerce.number().int().min(0).max(365),
  defaultTerms: opt,
});

export async function saveSettings(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  await db.user.update({ where: { id: user.id }, data: parsed.data });
  revalidatePath('/', 'layout');
  return { ok: 'Settings saved' };
}

export async function changePassword(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const current = String(fd.get('current') ?? '');
  const next = String(fd.get('next') ?? '');
  if (!(await bcrypt.compare(current, user.passwordHash))) return { error: 'Current password is wrong' };
  if (next.length < 8) return { error: 'New password must be at least 8 characters' };
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 11) } });
  return { ok: 'Password updated' };
}
