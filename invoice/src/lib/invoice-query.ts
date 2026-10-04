import type { Prisma } from '@prisma/client';

export const fullInvoiceInclude = {
  items: { orderBy: { position: 'asc' } },
  issuer: true,
  client: true,
  recipient: true,
  payments: { orderBy: { paidAt: 'desc' }, include: { recordedBy: { select: { name: true } } } },
} satisfies Prisma.InvoiceInclude;

export type FullInvoice = Prisma.InvoiceGetPayload<{ include: typeof fullInvoiceInclude }>;

/** Who the invoice is billed to, for display. */
export function billTo(inv: Pick<FullInvoice, 'client' | 'recipient'>) {
  if (inv.client) {
    return {
      name: inv.client.company || inv.client.name,
      contact: inv.client.company ? inv.client.name : null,
      email: inv.client.email,
      address: inv.client.address,
      taxId: inv.client.taxId,
    };
  }
  const r = inv.recipient;
  return {
    name: r?.businessName || r?.name || 'Unknown',
    contact: r?.businessName ? r.name : null,
    email: r?.email ?? '',
    address: r?.address ?? null,
    taxId: r?.taxId ?? null,
  };
}

export function issuerName(u: { businessName: string | null; name: string }) {
  return u.businessName || u.name;
}

export type PaymentLine = { label: string; value: string };

/** The issuer's payment instructions, grouped by method. Empty groups are skipped. */
export function paymentInstructions(u: FullInvoice['issuer']) {
  const groups: { title: string; lines: PaymentLine[] }[] = [];
  const bank: PaymentLine[] = [
    ['Bank', u.bankName],
    ['Account name', u.bankAccountName],
    ['Account number', u.bankAccountNumber],
    ['Routing (ACH/wire)', u.bankRouting],
    ['SWIFT / BIC', u.bankSwift],
    ['Bank address', u.bankAddress],
  ]
    .filter((x): x is [string, string] => !!x[1])
    .map(([label, value]) => ({ label, value }));
  if (bank.length) groups.push({ title: 'Bank transfer', lines: bank });
  if (u.wiseEmail) groups.push({ title: 'Wise', lines: [{ label: 'Send to', value: u.wiseEmail }] });
  if (u.paypalEmail) groups.push({ title: 'PayPal', lines: [{ label: 'Send to', value: u.paypalEmail }] });
  return groups;
}
