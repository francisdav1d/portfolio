import Link from 'next/link';
import { UsersRound } from 'lucide-react';
import { requireOwner } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate, formatMoney } from '@/lib/money';
import { isOpen } from '@/lib/status';
import { Card, EmptyState, PageHeader } from '@/components/ui';
import { ActionButton } from '@/components/form';
import { setActive } from './actions';

export const metadata = { title: 'Freelancers' };

export default async function FreelancersPage() {
  const owner = await requireOwner();
  const freelancers = await db.user.findMany({
    where: { role: 'FREELANCER' },
    orderBy: [{ active: 'desc' }, { name: 'asc' }],
    include: {
      invoicesIssued: {
        where: { recipientId: owner.id, status: { notIn: ['DRAFT', 'VOID'] } },
        select: { status: true, totalCents: true, paidCents: true, currency: true, issueDate: true },
      },
    },
  });

  return (
    <>
      <PageHeader
        title="Freelancers"
        subtitle={
          <>
            People who bill you. Invite more from{' '}
            <Link href="/settings" className="font-medium text-brand-600 hover:underline">
              Settings
            </Link>
            .
          </>
        }
      />
      <Card>
        {freelancers.length === 0 ? (
          <EmptyState
            icon={<UsersRound className="size-5" />}
            title="No freelancers yet"
            body="When freelancers sign up, they’ll appear here along with what you owe them."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-5 py-3 font-medium">Freelancer</th>
                  <th className="px-5 py-3 font-medium">Last invoice</th>
                  <th className="px-5 py-3 text-right font-medium">Awaiting approval</th>
                  <th className="px-5 py-3 text-right font-medium">You owe</th>
                  <th className="px-5 py-3 text-right font-medium">Paid to date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {freelancers.map((f) => {
                  const inv = f.invoicesIssued;
                  const cur = inv[0]?.currency ?? owner.defaultCurrency;
                  const pending = inv.filter((i) => i.status === 'SUBMITTED');
                  const owed = inv.filter((i) => isOpen(i.status)).reduce((s, i) => s + i.totalCents - i.paidCents, 0);
                  const paid = inv.reduce((s, i) => s + i.paidCents, 0);
                  const last = inv.reduce<Date | null>((d, i) => (!d || i.issueDate > d ? i.issueDate : d), null);
                  return (
                    <tr key={f.id} className={`border-b border-zinc-50 last:border-0 ${f.active ? '' : 'opacity-50'}`}>
                      <td className="px-5 py-3">
                        <Link href={`/inbox?tab=all&q=${encodeURIComponent(f.name)}`} className="font-medium hover:text-brand-600">
                          {f.businessName || f.name}
                        </Link>
                        <p className="text-xs text-zinc-500">{f.email}</p>
                      </td>
                      <td className="px-5 py-3 text-zinc-600">{formatDate(last)}</td>
                      <td className="tabular px-5 py-3 text-right">
                        {pending.length ? (
                          <span className="font-medium text-amber-700">
                            {pending.length} · {formatMoney(pending.reduce((s, i) => s + i.totalCents, 0), cur)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="tabular px-5 py-3 text-right font-medium">{owed ? formatMoney(owed, cur) : '—'}</td>
                      <td className="tabular px-5 py-3 text-right text-emerald-700">{paid ? formatMoney(paid, cur) : '—'}</td>
                      <td className="px-5 py-3 text-right">
                        <ActionButton
                          action={setActive}
                          fields={{ id: f.id, active: String(!f.active) }}
                          variant="ghost"
                          confirm={f.active ? `Deactivate ${f.name}? They won’t be able to sign in.` : undefined}
                        >
                          {f.active ? 'Deactivate' : 'Reactivate'}
                        </ActionButton>
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
