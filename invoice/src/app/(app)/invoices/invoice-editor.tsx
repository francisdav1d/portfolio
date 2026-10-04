'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { GripVertical, Loader2, Plus, Send, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { Alert, btn, Card, Field, Input, Select, Textarea, inputClass } from '@/components/ui';
import { computeTotals, CURRENCIES, formatMoney, toCents } from '@/lib/money';
import { saveInvoiceAction } from './actions';

export type EditorClient = { id: string; name: string; company: string | null; email: string; currency: string };
export type EditorRecipient = { id: string; name: string; businessName: string | null; email: string; role: string };

export type EditorInitial = {
  id?: string;
  number: string;
  clientId: string;
  recipientId: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  items: { description: string; quantity: string; unitPrice: string }[];
  discountType: 'PERCENT' | 'AMOUNT';
  discountValue: string;
  taxRate: string;
  notes: string;
  terms: string;
  remindersOn: boolean;
};

const addDays = (iso: string, days: number) => {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
const daysBetween = (a: string, b: string) =>
  Math.round((new Date(b + 'T00:00:00Z').getTime() - new Date(a + 'T00:00:00Z').getTime()) / 86_400_000);

const TERMS = [
  { label: 'Due on receipt', days: 0 },
  { label: 'Net 7', days: 7 },
  { label: 'Net 14', days: 14 },
  { label: 'Net 15', days: 15 },
  { label: 'Net 30', days: 30 },
  { label: 'Net 45', days: 45 },
  { label: 'Net 60', days: 60 },
];

export function InvoiceEditor({
  kind,
  initial,
  clients = [],
  recipients = [],
  status,
  nextNumberHint,
}: {
  kind: 'OUTGOING' | 'INTERNAL';
  initial: EditorInitial;
  clients?: EditorClient[];
  recipients?: EditorRecipient[];
  status?: string;
  nextNumberHint: string;
}) {
  const [v, setV] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [busyIntent, setBusyIntent] = useState<string | null>(null);

  const set = <K extends keyof EditorInitial>(k: K, val: EditorInitial[K]) => setV((s) => ({ ...s, [k]: val }));
  const setItem = (i: number, patch: Partial<EditorInitial['items'][number]>) =>
    setV((s) => ({ ...s, items: s.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) }));

  const totals = useMemo(
    () =>
      computeTotals({
        items: v.items.map((i) => ({
          description: i.description,
          quantity: parseFloat(i.quantity) || 0,
          unitPriceCents: toCents(i.unitPrice),
        })),
        discountType: v.discountType,
        discountValue: v.discountType === 'AMOUNT' ? toCents(v.discountValue) : parseFloat(v.discountValue) || 0,
        taxRate: parseFloat(v.taxRate) || 0,
      }),
    [v.items, v.discountType, v.discountValue, v.taxRate],
  );

  const termDays = daysBetween(v.issueDate, v.dueDate);
  const recipient = recipients.find((r) => r.id === v.recipientId);

  function submit(intent: 'draft' | 'send' | 'submit') {
    setError(null);
    setBusyIntent(intent);
    start(async () => {
      const payload = {
        id: v.id,
        kind,
        clientId: kind === 'OUTGOING' ? v.clientId : null,
        recipientId: kind === 'INTERNAL' ? v.recipientId : null,
        number: v.number.trim() || undefined,
        issueDate: v.issueDate,
        dueDate: v.dueDate,
        currency: v.currency,
        items: v.items
          .filter((i) => i.description.trim() || parseFloat(i.unitPrice))
          .map((i) => ({ description: i.description, quantity: i.quantity || '0', unitPrice: i.unitPrice || '0' })),
        discountType: v.discountType,
        discountValue: v.discountValue || '0',
        taxRate: v.taxRate || '0',
        notes: v.notes,
        terms: v.terms,
        remindersOn: v.remindersOn,
      };
      const res = await saveInvoiceAction(payload, intent);
      // On success the action redirects; we only get here on error.
      if (res?.error) {
        setError(res.error);
        setBusyIntent(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  const spinner = (intent: string) => (pending && busyIntent === intent ? <Loader2 className="size-4 animate-spin" /> : null);

  return (
    <div className="space-y-6">
      {error ? <Alert>{error}</Alert> : null}
      {status === 'REJECTED' ? (
        <Alert tone="info">This invoice was sent back. Make your changes, then resubmit it.</Alert>
      ) : null}

      <Card className="p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            {kind === 'OUTGOING' ? (
              <Field
                label="Bill to"
                hint={
                  <Link href="/clients/new?returnTo=invoice" className="font-medium text-brand-600 hover:underline">
                    + Add a new client
                  </Link>
                }
              >
                <Select
                  value={v.clientId}
                  onChange={(e) => {
                    const c = clients.find((c) => c.id === e.target.value);
                    setV((s) => ({ ...s, clientId: e.target.value, currency: !s.id && c ? c.currency : s.currency }));
                  }}
                >
                  <option value="">Choose a client…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company ? `${c.company} (${c.name})` : c.name} · {c.email}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : (
              <Field label="Send to" hint="The invoice lands in their inbox for approval.">
                <Select value={v.recipientId} onChange={(e) => set('recipientId', e.target.value)}>
                  {recipients.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.businessName || r.name}
                      {r.role === 'OWNER' ? ' (default)' : ''} · {r.email}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Invoice number" hint={v.id ? undefined : 'Leave blank to auto-number'}>
                <Input value={v.number} placeholder={nextNumberHint} onChange={(e) => set('number', e.target.value)} />
              </Field>
              <Field label="Currency">
                <Select value={v.currency} onChange={(e) => set('currency', e.target.value)}>
                  {CURRENCIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Field label="Issue date">
              <Input
                type="date"
                value={v.issueDate}
                onChange={(e) => {
                  const issueDate = e.target.value;
                  if (issueDate) setV((s) => ({ ...s, issueDate, dueDate: addDays(issueDate, Math.max(termDays, 0)) }));
                }}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Payment terms">
                <Select
                  value={TERMS.find((t) => t.days === termDays) ? String(termDays) : 'custom'}
                  onChange={(e) => e.target.value !== 'custom' && set('dueDate', addDays(v.issueDate, Number(e.target.value)))}
                >
                  {TERMS.map((t) => (
                    <option key={t.days} value={t.days}>
                      {t.label}
                    </option>
                  ))}
                  <option value="custom">Custom</option>
                </Select>
              </Field>
              <Field label="Due date">
                <Input type="date" value={v.dueDate} min={v.issueDate} onChange={(e) => set('dueDate', e.target.value)} />
              </Field>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="hidden grid-cols-[1fr_90px_130px_120px_36px] gap-3 border-b border-zinc-100 px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 md:grid">
          <span>Description</span>
          <span className="text-right">Qty / hrs</span>
          <span className="text-right">Rate</span>
          <span className="text-right">Amount</span>
          <span />
        </div>
        <div className="divide-y divide-zinc-100">
          {v.items.map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-3 px-5 py-3 md:grid-cols-[1fr_90px_130px_120px_36px] md:items-start">
              <div className="col-span-2 flex gap-2 md:col-span-1">
                <GripVertical className="mt-2.5 hidden size-4 shrink-0 text-zinc-300 md:block" />
                <textarea
                  rows={1}
                  value={item.description}
                  onChange={(e) => setItem(i, { description: e.target.value })}
                  placeholder="What did you do? e.g. Website redesign — homepage"
                  className={clsx(inputClass, 'field-sizing-content min-h-[38px] resize-none')}
                />
              </div>
              <input
                inputMode="decimal"
                value={item.quantity}
                onChange={(e) => setItem(i, { quantity: e.target.value })}
                className={clsx(inputClass, 'tabular text-right')}
                aria-label="Quantity"
              />
              <div className="relative">
                <input
                  inputMode="decimal"
                  value={item.unitPrice}
                  onChange={(e) => setItem(i, { unitPrice: e.target.value })}
                  placeholder="0.00"
                  className={clsx(inputClass, 'tabular text-right')}
                  aria-label="Rate"
                />
              </div>
              <div className="tabular flex items-center justify-end py-2 text-sm font-medium">
                {formatMoney(totals.items[i]?.amountCents ?? 0, v.currency)}
              </div>
              <button
                type="button"
                onClick={() => setV((s) => ({ ...s, items: s.items.filter((_, j) => j !== i) }))}
                disabled={v.items.length === 1}
                className="flex items-center justify-center rounded-md p-2 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                aria-label="Remove line"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="border-t border-zinc-100 px-5 py-3">
          <button
            type="button"
            className={btn.ghost}
            onClick={() => setV((s) => ({ ...s, items: [...s.items, { description: '', quantity: '1', unitPrice: '' }] }))}
          >
            <Plus className="size-4" /> Add line
          </button>
        </div>

        <div className="grid gap-6 border-t border-zinc-100 p-5 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <Field label="Notes" hint="Shown on the invoice, e.g. a thank-you or project summary">
              <Textarea rows={3} value={v.notes} onChange={(e) => set('notes', e.target.value)} />
            </Field>
            <Field label="Terms">
              <Textarea rows={2} value={v.terms} onChange={(e) => set('terms', e.target.value)} />
            </Field>
            {kind === 'OUTGOING' ? (
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  checked={v.remindersOn}
                  onChange={(e) => set('remindersOn', e.target.checked)}
                  className="size-4 rounded border-zinc-300 text-brand-600"
                />
                Email automatic reminders when this invoice is overdue
              </label>
            ) : null}
          </div>

          <div className="space-y-2.5 rounded-lg bg-zinc-50 p-4 text-sm">
            <Row label="Subtotal" value={formatMoney(totals.subtotalCents, v.currency)} />
            <div className="flex items-center justify-between gap-3">
              <span className="text-zinc-600">Discount</span>
              <div className="flex items-center gap-1.5">
                <select
                  value={v.discountType}
                  onChange={(e) => set('discountType', e.target.value as 'PERCENT' | 'AMOUNT')}
                  className={clsx(inputClass, 'w-20! shrink-0 px-2 py-1')}
                >
                  <option value="PERCENT">%</option>
                  <option value="AMOUNT">{v.currency}</option>
                </select>
                <input
                  inputMode="decimal"
                  value={v.discountValue}
                  onChange={(e) => set('discountValue', e.target.value)}
                  className={clsx(inputClass, 'tabular w-24! shrink-0 py-1 text-right')}
                  placeholder="0"
                />
              </div>
            </div>
            {totals.discountCents ? <Row label="" value={`−${formatMoney(totals.discountCents, v.currency)}`} muted /> : null}
            <div className="flex items-center justify-between gap-3">
              <span className="whitespace-nowrap text-zinc-600">Tax %</span>
              <input
                inputMode="decimal"
                value={v.taxRate}
                onChange={(e) => set('taxRate', e.target.value)}
                className={clsx(inputClass, 'tabular w-24! shrink-0 py-1 text-right')}
                placeholder="0"
              />
            </div>
            {totals.taxCents ? <Row label="" value={formatMoney(totals.taxCents, v.currency)} muted /> : null}
            <div className="flex items-center justify-between border-t border-zinc-200 pt-3 text-base font-semibold">
              <span>Total</span>
              <span className="tabular">{formatMoney(totals.totalCents, v.currency)}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:shadow-sm">
        <Link href={v.id ? `/invoices/${v.id}` : '/invoices'} className={btn.ghost}>
          Cancel
        </Link>
        <button type="button" disabled={pending} onClick={() => submit('draft')} className={btn.secondary}>
          {spinner('draft')} Save {kind === 'INTERNAL' || !status || status === 'DRAFT' ? 'draft' : 'changes'}
        </button>
        {kind === 'OUTGOING' ? (
          <button type="button" disabled={pending} onClick={() => submit('send')} className={btn.primary}>
            {spinner('send') ?? <Send className="size-4" />} Save & send
          </button>
        ) : (
          <button type="button" disabled={pending || !recipient} onClick={() => submit('submit')} className={btn.primary}>
            {spinner('submit') ?? <Send className="size-4" />} {status === 'REJECTED' ? 'Resubmit' : 'Submit'} to{' '}
            {recipient?.name.split(' ')[0] ?? '…'}
          </button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={clsx('flex justify-between', muted && '-mt-1 text-xs text-zinc-500')}>
      <span className="text-zinc-600">{label}</span>
      <span className="tabular">{value}</span>
    </div>
  );
}
