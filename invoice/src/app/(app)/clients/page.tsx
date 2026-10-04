import Link from 'next/link';
import { Plus, UserRound } from 'lucide-react';
import { requireOwner } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatMoney } from '@/lib/money';
import { isOpen, isOverdue } from '@/lib/status';
import { Card, EmptyState, LinkButton, PageHeader } from '@/components/ui';

export const metadata = { title: 'Clients' };

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ archived?: string }> }) {
  const user = await requireOwner();
  const showArchived = (await searchParams).archived === '1';
  const clients = await db.client.findMany({
    where: { ownerId: user.id, archived: showArchived },
    orderBy: { name: 'asc' },
    include: { invoices: { select: { status: true, dueDate: true, totalCents: true, paidCents: true, currency: true } } },
  });

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle="People and companies you bill."
        actions={
          <>
            <LinkButton variant="ghost" href={showArchived ? '/clients' : '/clients?archived=1'}>
              {showArchived ? 'Show active' : 'Show archived'}
            </LinkButton>
            <LinkButton href="/clients/new">
              <Plus className="size-4" /> New client
            </LinkButton>
          </>
        }
      />
      <Card>
        {clients.length === 0 ? (
          <EmptyState
            icon={<UserRound className="size-5" />}
            title={showArchived ? 'No archived clients' : 'No clients yet'}
            body="Add a client to start sending them invoices."
            action={showArchived ? undefined : <LinkButton href="/clients/new">Add your first client</LinkButton>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 text-right font-medium">Invoices</th>
                  <th className="px-5 py-3 text-right font-medium">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => {
                  const open = c.invoices.filter((i) => isOpen(i.status));
                  const outstanding = open.reduce((s, i) => s + i.totalCents - i.paidCents, 0);
                  const overdue = open.some((i) => isOverdue(i));
                  return (
                    <tr key={c.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50">
                      <td className="px-5 py-3">
                        <Link href={`/clients/${c.id}`} className="font-medium text-zinc-900 hover:text-brand-600">
                          {c.company || c.name}
                        </Link>
                        {c.company ? <p className="text-xs text-zinc-500">{c.name}</p> : null}
                      </td>
                      <td className="px-5 py-3 text-zinc-600">{c.email}</td>
                      <td className="tabular px-5 py-3 text-right text-zinc-600">{c.invoices.length}</td>
                      <td className={`tabular px-5 py-3 text-right font-medium ${overdue ? 'text-red-600' : ''}`}>
                        {outstanding ? formatMoney(outstanding, c.currency) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
