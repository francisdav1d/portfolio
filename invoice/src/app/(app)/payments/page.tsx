import Link from 'next/link';
import clsx from 'clsx';
import { Download } from 'lucide-react';
import type { PaymentMethod, Prisma } from '@prisma/client';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate, formatMoney } from '@/lib/money';
import { METHOD_LABEL } from '@/lib/status';
import { issuerName } from '@/lib/invoice-query';
import { Card, PageHeader } from '@/components/ui';

export const metadata = { title: 'Payments' };

const METHODS = Object.keys(METHOD_LABEL) as PaymentMethod[];

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ dir?: string; method?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const dir = sp.dir === 'out' ? 'out' : 'in';
  const method = METHODS.includes(sp.method as PaymentMethod) ? (sp.method as PaymentMethod) : undefined;

  const where: Prisma.PaymentWhereInput = {
    invoice: dir === 'in' ? { issuerId: user.id } : { recipientId: user.id },
    ...(method ? { method } : {}),
  };
  const payments = await db.payment.findMany({
    where,
    orderBy: { paidAt: 'desc' },
    take: 500,
    include: { invoice: { include: { client: true, issuer: true, recipient: true } } },
  });

  const totals = new Map<string, number>();
  for (const p of payments) totals.set(p.invoice.currency, (totals.get(p.invoice.currency) ?? 0) + p.amountCents);

  const link = (patch: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const next = { dir, method, ...patch };
    if (next.dir === 'out') q.set('dir', 'out');
    if (next.method) q.set('method', next.method);
    const s = q.toString();
    return s ? `/payments?${s}` : '/payments';
  };
  const pill = (active: boolean) =>
    clsx('rounded-md px-2.5 py-1.5 text-sm font-medium', active ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-800');

  return (
    <>
      <PageHeader
        title="Payments"
        subtitle={[...totals].map(([c, t]) => formatMoney(t, c)).join(' · ') || 'No payments yet'}
        actions={
          <a href={`/api/export/payments?dir=${dir}`} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100">
            <Download className="size-4" /> Export CSV
          </a>
        }
      />
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 px-3 py-2">
          <div className="flex gap-1">
            <Link href={link({ dir: 'in' })} className={pill(dir === 'in')}>
              Received
            </Link>
            <Link href={link({ dir: 'out' })} className={pill(dir === 'out')}>
              Paid out
            </Link>
          </div>
          <div className="flex flex-wrap gap-1">
            <Link href={link({ method: undefined })} className={pill(!method)}>
              All methods
            </Link>
            {METHODS.map((m) => (
              <Link key={m} href={link({ method: m })} className={pill(method === m)}>
                {METHOD_LABEL[m]}
              </Link>
            ))}
          </div>
        </div>
        {payments.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Invoice</th>
                  <th className="px-5 py-3 font-medium">{dir === 'in' ? 'From' : 'To'}</th>
                  <th className="px-5 py-3 font-medium">Method</th>
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const inv = p.invoice;
                  const party =
                    dir === 'in'
                      ? inv.client
                        ? inv.client.company || inv.client.name
                        : inv.recipient?.name
                      : issuerName(inv.issuer);
                  return (
                    <tr key={p.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50">
                      <td className="px-5 py-3 text-zinc-600">{formatDate(p.paidAt)}</td>
                      <td className="px-5 py-3">
                        <Link href={`/invoices/${inv.id}`} className="font-medium hover:text-brand-600">
                          {inv.number}
                        </Link>
                      </td>
                      <td className="px-5 py-3">{party}</td>
                      <td className="px-5 py-3 text-zinc-600">{METHOD_LABEL[p.method]}</td>
                      <td className="max-w-[180px] truncate px-5 py-3 text-zinc-500">{p.reference ?? '—'}</td>
                      <td className="tabular px-5 py-3 text-right font-medium">{formatMoney(p.amountCents, inv.currency)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-5 py-10 text-center text-sm text-zinc-500">No payments here yet.</p>
        )}
      </Card>
    </>
  );
}
