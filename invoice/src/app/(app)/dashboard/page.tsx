import Link from 'next/link';
import { Inbox, Plus } from 'lucide-react';
import type { PaymentMethod } from '@prisma/client';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatMoney } from '@/lib/money';
import { isOpen, isOverdue, METHOD_LABEL } from '@/lib/status';
import { Card, CardHeader, LinkButton, PageHeader, Stat } from '@/components/ui';
import { InvoiceTable } from '../invoices/invoice-table';

export const metadata = { title: 'Dashboard' };

const sum = <T,>(xs: T[], f: (x: T) => number) => xs.reduce((s, x) => s + f(x), 0);

function lastMonths(n: number) {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (n - 1 - i), 1));
    return { key: d.toISOString().slice(0, 7), label: d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }) };
  });
}

export default async function DashboardPage() {
  const user = await requireUser();
  const owner = user.role === 'OWNER';
  const cur = user.defaultCurrency;
  const yearAgo = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 11, 1));

  const [issued, received, paymentsIn, paymentsOut] = await Promise.all([
    db.invoice.findMany({
      where: { issuerId: user.id, status: { notIn: ['DRAFT', 'VOID'] } },
      include: { client: true, recipient: true, issuer: true },
      orderBy: { issueDate: 'desc' },
    }),
    db.invoice.findMany({
      where: { recipientId: user.id, status: { notIn: ['DRAFT', 'VOID'] } },
      include: { client: true, recipient: true, issuer: true },
      orderBy: { issueDate: 'desc' },
    }),
    db.payment.findMany({
      where: { invoice: { issuerId: user.id, currency: cur }, paidAt: { gte: yearAgo } },
      select: { amountCents: true, method: true, paidAt: true },
    }),
    db.payment.findMany({
      where: { invoice: { recipientId: user.id, currency: cur }, paidAt: { gte: yearAgo } },
      select: { amountCents: true, paidAt: true },
    }),
  ]);

  const inCur = <T extends { currency: string }>(xs: T[]) => xs.filter((x) => x.currency === cur);
  const openIssued = inCur(issued).filter((i) => isOpen(i.status));
  const outstanding = sum(openIssued, (i) => i.totalCents - i.paidCents);
  const overdueList = openIssued.filter((i) => isOverdue(i));
  const overdue = sum(overdueList, (i) => i.totalCents - i.paidCents);
  const awaitingMyApproval = received.filter((i) => i.status === 'SUBMITTED');
  const owedByMe = sum(
    inCur(received).filter((i) => isOpen(i.status)),
    (i) => i.totalCents - i.paidCents,
  );
  const pendingTheirApproval = issued.filter((i) => i.status === 'SUBMITTED');

  const months = lastMonths(12);
  const byMonth = new Map(months.map((m) => [m.key, 0]));
  for (const p of paymentsIn) {
    const k = p.paidAt.toISOString().slice(0, 7);
    if (byMonth.has(k)) byMonth.set(k, byMonth.get(k)! + p.amountCents);
  }
  const series = months.map((m) => ({ ...m, value: byMonth.get(m.key)! }));
  const maxMonth = Math.max(...series.map((s) => s.value), 1);
  const thisMonth = series[series.length - 1].value;
  const yearTotal = sum(series, (s) => s.value);

  const byMethod = (['BANK_TRANSFER', 'WISE', 'PAYPAL', 'OTHER'] as PaymentMethod[]).map((m) => {
    const ps = paymentsIn.filter((p) => p.method === m);
    return { method: m, count: ps.length, total: sum(ps, (p) => p.amountCents) };
  });
  const paidOutYear = sum(paymentsOut, (p) => p.amountCents);

  const needsAttention = [...overdueList].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()).slice(0, 6);

  return (
    <>
      <PageHeader
        title={`Hi, ${user.name.split(' ')[0]}`}
        subtitle={`Here’s where your money stands. Totals are in ${cur}.`}
        actions={
          <LinkButton href="/invoices/new">
            <Plus className="size-4" /> New invoice
          </LinkButton>
        }
      />

      {awaitingMyApproval.length ? (
        <Link
          href="/inbox"
          className="mb-6 flex items-center gap-3 rounded-xl bg-amber-50 px-5 py-4 ring-1 ring-amber-200 hover:bg-amber-100/70"
        >
          <Inbox className="size-5 text-amber-700" />
          <p className="text-sm text-amber-900">
            <strong>
              {awaitingMyApproval.length} invoice{awaitingMyApproval.length === 1 ? '' : 's'}
            </strong>{' '}
            waiting for your approval, totaling{' '}
            {formatMoney(sum(inCur(awaitingMyApproval), (i) => i.totalCents), cur)}.
          </p>
          <span className="ml-auto text-sm font-medium text-amber-800">Review →</span>
        </Link>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label={owner ? 'Outstanding' : 'Owed to you'}
          value={formatMoney(outstanding, cur)}
          sub={`${openIssued.length} unpaid invoice${openIssued.length === 1 ? '' : 's'}`}
        />
        <Stat
          label="Overdue"
          value={formatMoney(overdue, cur)}
          sub={`${overdueList.length} invoice${overdueList.length === 1 ? '' : 's'}`}
          tone={overdue ? 'danger' : undefined}
        />
        <Stat label="Received this month" value={formatMoney(thisMonth, cur)} sub={`${formatMoney(yearTotal, cur)} in the last 12 months`} tone="success" />
        {owner ? (
          <Stat
            label="You owe freelancers"
            value={formatMoney(owedByMe, cur)}
            sub={`${formatMoney(paidOutYear, cur)} paid out in 12 months`}
          />
        ) : (
          <Stat label="Awaiting approval" value={String(pendingTheirApproval.length)} sub="Submitted, not yet reviewed" />
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader title="Money received" subtitle="Last 12 months, by payment date" />
          <div className="px-5 pb-4 pt-6">
            <div className="flex h-44 items-end gap-[2px]" role="img" aria-label="Monthly money received over the last 12 months">
              {series.map((s) => (
                <div key={s.key} className="group relative flex h-full flex-1 items-end justify-center">
                  <div
                    className="w-full max-w-9 rounded-t-[4px] bg-brand-500 transition-colors group-hover:bg-brand-700"
                    style={{ height: `${s.value ? Math.max((s.value / maxMonth) * 100, 2) : 0}%` }}
                  />
                  <div className="pointer-events-none absolute bottom-full mb-1 hidden whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs text-white shadow group-hover:block">
                    {s.label}: {formatMoney(s.value, cur)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-[2px] border-t border-zinc-200 pt-2">
              {series.map((s) => (
                <span key={s.key} className="flex-1 text-center text-[11px] text-zinc-500">
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Received by method" subtitle="Last 12 months" />
          <table className="w-full text-sm">
            <tbody>
              {byMethod.map((m) => (
                <tr key={m.method} className="border-b border-zinc-50 last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-medium">{METHOD_LABEL[m.method]}</p>
                    <p className="text-xs text-zinc-500">
                      {m.count} payment{m.count === 1 ? '' : 's'}
                    </p>
                  </td>
                  <td className="tabular px-5 py-3 text-right font-medium">{formatMoney(m.total, cur)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="mt-6 grid gap-6">
        <Card>
          <CardHeader title="Overdue" subtitle="Oldest first" />
          <InvoiceTable invoices={needsAttention} perspective="issuer" empty="Nothing overdue. Nice." />
        </Card>
        <Card>
          <CardHeader
            title={owner ? 'Recent from freelancers' : 'Recent invoices'}
            action={
              <Link href={owner ? '/inbox?tab=all' : '/invoices'} className="text-xs font-medium text-brand-600 hover:underline">
                View all
              </Link>
            }
          />
          <InvoiceTable
            invoices={(owner ? received : issued).slice(0, 6)}
            perspective={owner ? 'recipient' : 'issuer'}
            empty={owner ? 'No freelancer invoices yet.' : 'You haven’t sent any invoices yet.'}
          />
        </Card>
      </div>
    </>
  );
}
