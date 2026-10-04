import type { InvoiceKind, InvoiceStatus, PaymentMethod } from '@prisma/client';

export type DisplayStatus = InvoiceStatus | 'OVERDUE';

const OPEN_STATUSES: InvoiceStatus[] = ['SENT', 'VIEWED', 'APPROVED', 'PARTIAL'];

/** Statuses that represent money still owed. */
export function isOpen(status: InvoiceStatus) {
  return OPEN_STATUSES.includes(status);
}

export function isOverdue(inv: { status: InvoiceStatus; dueDate: Date }, now = new Date()) {
  return isOpen(inv.status) && inv.dueDate.getTime() < startOfUtcDay(now).getTime();
}

export function displayStatus(inv: { status: InvoiceStatus; dueDate: Date }): DisplayStatus {
  return isOverdue(inv) ? 'OVERDUE' : inv.status;
}

export function startOfUtcDay(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export const STATUS_LABEL: Record<DisplayStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  VIEWED: 'Viewed',
  SUBMITTED: 'Awaiting approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PARTIAL: 'Partially paid',
  PAID: 'Paid',
  VOID: 'Void',
  OVERDUE: 'Overdue',
};

export const STATUS_STYLE: Record<DisplayStatus, string> = {
  DRAFT: 'bg-zinc-100 text-zinc-700 ring-zinc-200',
  SENT: 'bg-sky-50 text-sky-700 ring-sky-200',
  VIEWED: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  SUBMITTED: 'bg-amber-50 text-amber-800 ring-amber-200',
  APPROVED: 'bg-teal-50 text-teal-700 ring-teal-200',
  REJECTED: 'bg-rose-50 text-rose-700 ring-rose-200',
  PARTIAL: 'bg-violet-50 text-violet-700 ring-violet-200',
  PAID: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  VOID: 'bg-zinc-100 text-zinc-500 ring-zinc-200 line-through',
  OVERDUE: 'bg-red-50 text-red-700 ring-red-200',
};

export const METHOD_LABEL: Record<PaymentMethod, string> = {
  BANK_TRANSFER: 'Bank transfer',
  WISE: 'Wise',
  PAYPAL: 'PayPal',
  OTHER: 'Other',
};

/** Status after payments change. Keeps pre-payment status when nothing is paid. */
export function statusAfterPayment(
  inv: { kind: InvoiceKind; status: InvoiceStatus; viewedAt: Date | null },
  paidCents: number,
  totalCents: number,
): InvoiceStatus {
  const current = inv.status;
  if (current === 'VOID' || current === 'DRAFT' || current === 'REJECTED') return current;
  if (paidCents >= totalCents && totalCents > 0) return 'PAID';
  if (paidCents > 0) return 'PARTIAL';
  // All payments removed: fall back to the pre-payment state.
  if (current === 'PAID' || current === 'PARTIAL') {
    if (inv.kind === 'INTERNAL') return 'APPROVED';
    return inv.viewedAt ? 'VIEWED' : 'SENT';
  }
  return current;
}
