import 'server-only';
import type { User } from '@prisma/client';
import { db } from '@/lib/db';
import type { EditorClient, EditorRecipient } from './invoice-editor';

export async function editorOptions(user: User) {
  if (user.role === 'OWNER') {
    const clients: EditorClient[] = await db.client.findMany({
      where: { ownerId: user.id, archived: false },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, company: true, email: true, currency: true },
    });
    return { kind: 'OUTGOING' as const, clients, recipients: [] as EditorRecipient[], defaultRecipientId: '' };
  }

  const users = await db.user.findMany({
    where: { active: true, id: { not: user.id } },
    select: { id: true, name: true, businessName: true, email: true, role: true },
  });
  // Owner(s) first, then everyone else alphabetically.
  const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase();
  const recipients = users.sort(
    (a, b) =>
      Number(b.email === ownerEmail) - Number(a.email === ownerEmail) ||
      Number(b.role === 'OWNER') - Number(a.role === 'OWNER') ||
      a.name.localeCompare(b.name),
  );
  return { kind: 'INTERNAL' as const, clients: [] as EditorClient[], recipients, defaultRecipientId: recipients[0]?.id ?? '' };
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function nextNumberHint(user: User) {
  return `${user.invoicePrefix}-${String(user.nextInvoiceNumber).padStart(4, '0')}`;
}
