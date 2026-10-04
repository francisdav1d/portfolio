'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireOwner } from '@/lib/auth';
import type { FormState } from '../../(auth)/actions';

const opt = z
  .string()
  .trim()
  .max(1000)
  .transform((s) => s || null)
  .optional();

const clientSchema = z.object({
  name: z.string().trim().min(1, 'Contact name is required').max(200),
  company: opt,
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  ccEmails: opt.refine(
    (s) => !s || s.split(',').every((e) => z.string().email().safeParse(e.trim()).success),
    'CC must be a comma-separated list of emails',
  ),
  phone: opt,
  address: opt,
  taxId: opt,
  currency: z.string().length(3),
  notes: opt,
});

export async function saveClient(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireOwner();
  const parsed = clientSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const id = fd.get('id') as string | null;

  if (id) {
    const res = await db.client.updateMany({ where: { id, ownerId: user.id }, data: parsed.data });
    if (!res.count) return { error: 'Client not found' };
    revalidatePath(`/clients/${id}`);
    return { ok: 'Client saved' };
  }
  const client = await db.client.create({ data: { ...parsed.data, ownerId: user.id } });
  const returnTo = fd.get('returnTo');
  if (returnTo === 'invoice') redirect(`/invoices/new?client=${client.id}`);
  redirect(`/clients/${client.id}`);
}

export async function setArchived(fd: FormData) {
  const user = await requireOwner();
  const id = String(fd.get('id'));
  const archived = fd.get('archived') === 'true';
  await db.client.updateMany({ where: { id, ownerId: user.id }, data: { archived } });
  revalidatePath('/clients');
  revalidatePath(`/clients/${id}`);
}
