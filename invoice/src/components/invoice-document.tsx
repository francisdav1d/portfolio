import { formatDate, formatMoney } from '@/lib/money';
import { billTo, issuerName, paymentInstructions, type FullInvoice } from '@/lib/invoice-query';
import { displayStatus } from '@/lib/status';
import { StatusBadge } from './ui';

export function InvoiceDocument({ inv }: { inv: FullInvoice }) {
  const to = billTo(inv);
  const from = inv.issuer;
  const balance = inv.totalCents - inv.paidCents;
  const pay = paymentInstructions(from);
  const m = (c: number) => formatMoney(c, inv.currency);

  return (
    <article className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 sm:p-10 print:p-0 print:shadow-none print:ring-0">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-xs">
          <p className="text-xl font-bold tracking-tight">{issuerName(from)}</p>
          <div className="mt-1 space-y-0.5 text-sm text-zinc-500">
            {from.businessName ? <p>{from.name}</p> : null}
            {from.address ? <p className="whitespace-pre-line">{from.address}</p> : null}
            <p>{from.email}</p>
            {from.phone ? <p>{from.phone}</p> : null}
            {from.taxId ? <p>Tax ID: {from.taxId}</p> : null}
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold tracking-tight text-brand-600">Invoice</p>
          <p className="mt-1 font-medium text-zinc-700">{inv.number}</p>
          <StatusBadge status={displayStatus(inv)} className="mt-2" />
        </div>
      </header>

      <section className="mt-10 grid gap-6 sm:grid-cols-[1fr_260px]">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Bill to</p>
          <p className="mt-1.5 font-semibold">{to.name}</p>
          <div className="space-y-0.5 text-sm text-zinc-500">
            {to.contact ? <p className="text-zinc-700">{to.contact}</p> : null}
            {to.address ? <p className="whitespace-pre-line">{to.address}</p> : null}
            <p>{to.email}</p>
            {to.taxId ? <p>Tax ID: {to.taxId}</p> : null}
          </div>
        </div>
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-500">Issue date</dt>
            <dd>{formatDate(inv.issueDate)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">Due date</dt>
            <dd>{formatDate(inv.dueDate)}</dd>
          </div>
          <div className="mt-3 flex justify-between rounded-lg bg-brand-50 px-3 py-2.5 font-semibold text-brand-700">
            <dt>Balance due</dt>
            <dd className="tabular">{m(balance)}</dd>
          </div>
        </dl>
      </section>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b-2 border-zinc-900 text-left text-xs uppercase tracking-wider text-zinc-500">
              <th className="pb-2 font-medium">Description</th>
              <th className="w-20 pb-2 text-right font-medium">Qty</th>
              <th className="w-28 pb-2 text-right font-medium">Rate</th>
              <th className="w-32 pb-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((i) => (
              <tr key={i.id} className="border-b border-zinc-100 align-top">
                <td className="whitespace-pre-line py-3 pr-4">{i.description}</td>
                <td className="tabular py-3 text-right text-zinc-600">{i.quantity}</td>
                <td className="tabular py-3 text-right text-zinc-600">{m(i.unitPriceCents)}</td>
                <td className="tabular py-3 text-right font-medium">{m(i.amountCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 ml-auto max-w-xs space-y-1.5 text-sm">
        <Line label="Subtotal" value={m(inv.subtotalCents)} />
        {inv.discountCents ? (
          <Line
            label={`Discount${inv.discountType === 'PERCENT' ? ` (${inv.discountValue}%)` : ''}`}
            value={`−${m(inv.discountCents)}`}
          />
        ) : null}
        {inv.taxCents ? <Line label={`Tax (${inv.taxRate}%)`} value={m(inv.taxCents)} /> : null}
        <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold">
          <span>Total</span>
          <span className="tabular">{m(inv.totalCents)}</span>
        </div>
        {inv.paidCents ? (
          <>
            <Line label="Paid" value={`−${m(inv.paidCents)}`} />
            <div className="flex justify-between font-semibold">
              <span>Balance due</span>
              <span className="tabular">{m(balance)}</span>
            </div>
          </>
        ) : null}
      </div>

      {inv.notes ? (
        <section className="mt-10">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Notes</p>
          <p className="mt-1.5 whitespace-pre-line text-sm text-zinc-700">{inv.notes}</p>
        </section>
      ) : null}

      {pay.length || from.paymentNotes ? (
        <section className="mt-8 rounded-lg bg-zinc-50 p-5 ring-1 ring-zinc-200 print:break-inside-avoid">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">How to pay</p>
          <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-5">
            {pay.map((g) => (
              <div key={g.title} className="text-sm">
                <p className="mb-1 font-semibold">{g.title}</p>
                {g.lines.map((l) => (
                  <p key={l.label} className="break-words">
                    <span className="text-zinc-500">{l.label}:</span> {l.value}
                  </p>
                ))}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm">
            Please use <strong>{inv.number}</strong> as the payment reference.
          </p>
          {from.paymentNotes ? <p className="mt-1 whitespace-pre-line text-sm text-zinc-500">{from.paymentNotes}</p> : null}
        </section>
      ) : null}

      {inv.terms ? (
        <section className="mt-8">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Terms</p>
          <p className="mt-1.5 whitespace-pre-line text-sm text-zinc-500">{inv.terms}</p>
        </section>
      ) : null}
    </article>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className="tabular">{value}</span>
    </div>
  );
}
