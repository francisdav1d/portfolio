import Link from 'next/link';
import type { InvoiceStatus, Prisma, User } from '@prisma/client';
import clsx from 'clsx';
import { Download, Search } from 'lucide-react';
import { db } from '@/lib/db';
import { startOfUtcDay } from '@/lib/status';
import { Card, inputClass } from '@/components/ui';
import { InvoiceTable } from './invoice-table';

const OPEN: InvoiceStatus[] = ['SENT', 'VIEWED', 'APPROVED', 'PARTIAL'];

type Tab = { key: string; label: string; where: Prisma.InvoiceWhereInput };

function tabsFor(mode: 'issued' | 'received', outgoing: boolean): Tab[] {
  const overdue: Prisma.InvoiceWhereInput = { status: { in: OPEN }, dueDate: { lt: startOfUtcDay(new Date()) } };
  const tabs: Tab[] = [{ key: 'all', label: 'All', where: {} }];
  if (mode === 'received') {
    tabs.push(
      { key: 'review', label: 'Needs approval', where: { status: 'SUBMITTED' } },
      { key: 'unpaid', label: 'To pay', where: { status: { in: ['APPROVED', 'PARTIAL'] } } },
      { key: 'overdue', label: 'Overdue', where: overdue },
      { key: 'paid', label: 'Paid', where: { status: 'PAID' } },
      { key: 'rejected', label: 'Sent back', where: { status: 'REJECTED' } },
    );
  } else {
    tabs.push({ key: 'draft', label: 'Drafts', where: { status: 'DRAFT' } });
    if (!outgoing) {
      tabs.push(
        { key: 'review', label: 'Awaiting approval', where: { status: 'SUBMITTED' } },
        { key: 'rejected', label: 'Sent back', where: { status: 'REJECTED' } },
      );
    }
    tabs.push(
      { key: 'unpaid', label: 'Unpaid', where: { status: { in: OPEN } } },
      { key: 'overdue', label: 'Overdue', where: overdue },
      { key: 'paid', label: 'Paid', where: { status: 'PAID' } },
      { key: 'void', label: 'Void', where: { status: 'VOID' } },
    );
  }
  return tabs;
}

export async function InvoiceList({
  user,
  mode,
  basePath,
  params,
  defaultTab = 'all',
}: {
  user: User;
  mode: 'issued' | 'received';
  basePath: string;
  params: { tab?: string; q?: string };
  defaultTab?: string;
}) {
  const owner = user.role === 'OWNER';
  const tabs = tabsFor(mode, owner);
  const active = tabs.find((t) => t.key === (params.tab ?? defaultTab)) ?? tabs[0];
  const q = params.q?.trim();

  const scope: Prisma.InvoiceWhereInput =
    mode === 'issued' ? { issuerId: user.id } : { recipientId: user.id, status: { not: 'DRAFT' } };
  const search: Prisma.InvoiceWhereInput = q
    ? {
        OR: [
          { number: { contains: q, mode: 'insensitive' } },
          { client: { name: { contains: q, mode: 'insensitive' } } },
          { client: { company: { contains: q, mode: 'insensitive' } } },
          { recipient: { name: { contains: q, mode: 'insensitive' } } },
          { issuer: { name: { contains: q, mode: 'insensitive' } } },
          { issuer: { businessName: { contains: q, mode: 'insensitive' } } },
        ],
      }
    : {};

  const [invoices, counts] = await Promise.all([
    db.invoice.findMany({
      where: { AND: [scope, active.where, search] },
      orderBy: [{ issueDate: 'desc' }, { createdAt: 'desc' }],
      include: { client: true, recipient: true, issuer: true },
      take: 500,
    }),
    Promise.all(tabs.map((t) => db.invoice.count({ where: { AND: [scope, t.where] } }))),
  ]);

  const href = (tab: string) => {
    const sp = new URLSearchParams();
    if (tab !== defaultTab) sp.set('tab', tab);
    if (q) sp.set('q', q);
    const s = sp.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-3 py-2">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {tabs.map((t, i) => (
            <Link
              key={t.key}
              href={href(t.key)}
              className={clsx(
                'flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium',
                t.key === active.key ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-800',
              )}
            >
              {t.label}
              <span
                className={clsx(
                  'tabular rounded-full px-1.5 text-[11px]',
                  t.key === 'overdue' && counts[i] ? 'bg-red-100 text-red-700' : 'bg-zinc-200/70 text-zinc-600',
                  t.key === 'review' && counts[i] ? 'bg-amber-100 text-amber-800' : '',
                )}
              >
                {counts[i]}
              </span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <form className="relative">
            {active.key !== defaultTab ? <input type="hidden" name="tab" value={active.key} /> : null}
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input name="q" defaultValue={q} placeholder="Search…" className={clsx(inputClass, 'w-48 py-1.5 pl-8')} />
          </form>
          <a
            href={`/api/export/invoices?mode=${mode}`}
            className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
            title="Export CSV"
          >
            <Download className="size-4" />
          </a>
        </div>
      </div>
      <InvoiceTable
        invoices={invoices}
        perspective={mode === 'issued' ? 'issuer' : 'recipient'}
        empty={q ? `Nothing matches “${q}”.` : 'Nothing here yet.'}
      />
    </Card>
  );
}
