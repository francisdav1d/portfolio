import Link from 'next/link';
import type { Client, Invoice, User } from '@prisma/client';
import { formatDate, formatMoney } from '@/lib/money';
import { displayStatus, isOverdue } from '@/lib/status';
import { StatusBadge } from '@/components/ui';

type Row = Invoice & { client: Client | null; recipient: User | null; issuer: User };

/** perspective "issuer" shows who it's billed to; "recipient" shows who sent it. */
export function InvoiceTable({
  invoices,
  perspective,
  empty,
}: {
  invoices: Row[];
  perspective: 'issuer' | 'recipient';
  empty?: string;
}) {
  if (!invoices.length) return <p className="px-5 py-10 text-center text-sm text-zinc-500">{empty ?? 'No invoices.'}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-500">
            <th className="px-5 py-3 font-medium">Invoice</th>
            <th className="px-5 py-3 font-medium">{perspective === 'issuer' ? 'Billed to' : 'From'}</th>
            <th className="px-5 py-3 font-medium">Issued</th>
            <th className="px-5 py-3 font-medium">Due</th>
            <th className="px-5 py-3 text-right font-medium">Total</th>
            <th className="px-5 py-3 text-right font-medium">Balance</th>
            <th className="px-5 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => {
            const who =
              perspective === 'issuer'
                ? inv.client
                  ? inv.client.company || inv.client.name
                  : inv.recipient?.businessName || inv.recipient?.name
                : inv.issuer.businessName || inv.issuer.name;
            const overdue = isOverdue(inv);
            const balance = inv.totalCents - inv.paidCents;
            return (
              <tr key={inv.id} className="group relative border-b border-zinc-50 last:border-0 hover:bg-zinc-50">
                <td className="whitespace-nowrap px-5 py-3 font-medium">
                  <Link href={`/invoices/${inv.id}`} className="text-zinc-900 after:absolute after:inset-0 group-hover:text-brand-600">
                    {inv.number}
                  </Link>
                </td>
                <td className="px-5 py-3 text-zinc-700">{who}</td>
                <td className="whitespace-nowrap px-5 py-3 text-zinc-500">{formatDate(inv.issueDate)}</td>
                <td className={`whitespace-nowrap px-5 py-3 ${overdue ? 'font-medium text-red-600' : 'text-zinc-500'}`}>{formatDate(inv.dueDate)}</td>
                <td className="tabular whitespace-nowrap px-5 py-3 text-right">{formatMoney(inv.totalCents, inv.currency)}</td>
                <td className="tabular whitespace-nowrap px-5 py-3 text-right font-medium">
                  {inv.status === 'VOID' ? '—' : formatMoney(balance, inv.currency)}
                </td>
                <td className="whitespace-nowrap px-5 py-3">
                  <StatusBadge status={displayStatus(inv)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
