import 'server-only';
import type { InvoiceStatus, PaymentMethod, Prisma, User } from '@prisma/client';
import { z } from 'zod';
import { db } from './db';
import { computeTotals, formatMoney, toCents } from './money';
import { fullInvoiceInclude, issuerName, type FullInvoice } from './invoice-query';
import { isOpen, METHOD_LABEL, startOfUtcDay, statusAfterPayment } from './status';
import { appUrl, sendEmail } from './email/send';
import { invoiceEmail, noticeEmail, receiptEmail, reminderEmail } from './email/templates';
import { renderInvoicePdf } from './pdf';

type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };
const fail = (error: string) => ({ ok: false as const, error });

// ---------------------------------------------------------------------------
// Access

export async function getInvoiceFor(user: User, id: string) {
  const inv = await db.invoice.findUnique({ where: { id }, include: fullInvoiceInclude });
  if (!inv) return null;
  if (inv.issuerId !== user.id && inv.recipientId !== user.id) return null;
  return inv;
}

export function permissions(user: User, inv: FullInvoice) {
  const isIssuer = inv.issuerId === user.id;
  const isRecipient = inv.recipientId === user.id;
  const outgoing = inv.kind === 'OUTGOING';
  const s = inv.status;
  return {
    isIssuer,
    isRecipient,
    canEdit:
      isIssuer && (s === 'DRAFT' || s === 'REJECTED' || (outgoing && (s === 'SENT' || s === 'VIEWED') && inv.paidCents === 0)),
    canDelete: isIssuer && s === 'DRAFT',
    canSend: isIssuer && outgoing && s !== 'VOID' && s !== 'PAID',
    canRemind: isIssuer && outgoing && isOpen(s),
    canSubmit: isIssuer && !outgoing && (s === 'DRAFT' || s === 'REJECTED'),
    canReview: isRecipient && s === 'SUBMITTED',
    canRecordPayment: (outgoing ? isIssuer : isRecipient) && isOpen(s),
    canDeletePayment: outgoing ? isIssuer : isRecipient,
    canVoid: isIssuer && s !== 'VOID' && s !== 'PAID' && inv.paidCents === 0,
  };
}

export async function logActivity(invoiceId: string, actorId: string | null, type: string, message: string) {
  await db.activity.create({ data: { invoiceId, actorId, type, message } });
}

// ---------------------------------------------------------------------------
// Create / update

const money = z.coerce.number().finite().min(0).max(100_000_000);

export const invoiceInput = z
  .object({
    id: z.string().optional(),
    kind: z.enum(['OUTGOING', 'INTERNAL']),
    clientId: z.string().optional().nullable(),
    recipientId: z.string().optional().nullable(),
    number: z.string().trim().max(40).optional(),
    issueDate: z.string().date(),
    dueDate: z.string().date(),
    currency: z.string().length(3),
    items: z
      .array(
        z.object({
          description: z.string().trim().min(1, 'Every line needs a description').max(2000),
          quantity: z.coerce.number().finite().min(0).max(1_000_000),
          unitPrice: money,
        }),
      )
      .min(1, 'Add at least one line item'),
    discountType: z.enum(['PERCENT', 'AMOUNT']),
    discountValue: money,
    taxRate: z.coerce.number().finite().min(0).max(100),
    notes: z.string().max(5000).optional().nullable(),
    terms: z.string().max(5000).optional().nullable(),
    remindersOn: z.boolean().default(true),
  })
  .refine((v) => v.dueDate >= v.issueDate, { message: 'Due date must be on or after the issue date', path: ['dueDate'] })
  .refine((v) => (v.kind === 'OUTGOING' ? !!v.clientId : !!v.recipientId), {
    message: 'Choose who this invoice is for',
    path: ['clientId'],
  });

export type InvoiceInput = z.infer<typeof invoiceInput>;

async function nextNumber(tx: Prisma.TransactionClient, userId: string) {
  const u = await tx.user.update({
    where: { id: userId },
    data: { nextInvoiceNumber: { increment: 1 } },
    select: { invoicePrefix: true, nextInvoiceNumber: true },
  });
  const n = u.nextInvoiceNumber - 1;
  return `${u.invoicePrefix}-${String(n).padStart(4, '0')}`;
}

export async function saveInvoice(user: User, raw: unknown): Promise<Result<{ id: string }>> {
  const parsed = invoiceInput.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid invoice');
  const v = parsed.data;

  if (v.kind === 'OUTGOING') {
    if (user.role !== 'OWNER') return fail('Only the owner can bill external clients');
    const client = await db.client.findFirst({ where: { id: v.clientId!, ownerId: user.id } });
    if (!client) return fail('Client not found');
  } else {
    if (v.recipientId === user.id) return fail("You can't send an invoice to yourself");
    const r = await db.user.findFirst({ where: { id: v.recipientId!, active: true } });
    if (!r) return fail('Recipient not found');
  }

  const totals = computeTotals({
    items: v.items.map((i) => ({ description: i.description, quantity: i.quantity, unitPriceCents: toCents(i.unitPrice) })),
    discountType: v.discountType,
    discountValue: v.discountType === 'AMOUNT' ? toCents(v.discountValue) : v.discountValue,
    taxRate: v.taxRate,
  });

  const data = {
    kind: v.kind,
    clientId: v.kind === 'OUTGOING' ? v.clientId : null,
    recipientId: v.kind === 'INTERNAL' ? v.recipientId : null,
    issueDate: new Date(v.issueDate),
    dueDate: new Date(v.dueDate),
    currency: v.currency.toUpperCase(),
    subtotalCents: totals.subtotalCents,
    discountType: v.discountType,
    discountValue: v.discountType === 'AMOUNT' ? toCents(v.discountValue) : v.discountValue,
    discountCents: totals.discountCents,
    taxRate: v.taxRate,
    taxCents: totals.taxCents,
    totalCents: totals.totalCents,
    notes: v.notes || null,
    terms: v.terms || null,
    remindersOn: v.remindersOn,
  };
  const items = totals.items.map((i, position) => ({ ...i, position }));

  try {
    if (v.id) {
      const existing = await getInvoiceFor(user, v.id);
      if (!existing || !permissions(user, existing).canEdit) return fail('This invoice can no longer be edited');
      if (existing.kind !== v.kind) return fail('Invoice type cannot change');
      const number = v.number || existing.number;
      await db.$transaction([
        db.invoiceItem.deleteMany({ where: { invoiceId: v.id } }),
        db.invoice.update({ where: { id: v.id }, data: { ...data, number, items: { create: items } } }),
      ]);
      await logActivity(v.id, user.id, 'edited', `${user.name} edited the invoice`);
      return { ok: true, data: { id: v.id } };
    }

    const inv = await db.$transaction(async (tx) => {
      const number = v.number || (await nextNumber(tx, user.id));
      return tx.invoice.create({ data: { ...data, number, issuerId: user.id, items: { create: items } } });
    });
    await logActivity(inv.id, user.id, 'created', `${user.name} created invoice ${inv.number}`);
    return { ok: true, data: { id: inv.id } };
  } catch (e) {
    if ((e as { code?: string }).code === 'P2002') return fail('You already have an invoice with that number');
    throw e;
  }
}

export async function deleteDraft(user: User, id: string): Promise<Result> {
  const inv = await getInvoiceFor(user, id);
  if (!inv || !permissions(user, inv).canDelete) return fail('Only drafts can be deleted');
  await db.invoice.delete({ where: { id } });
  return { ok: true };
}

export async function duplicateInvoice(user: User, id: string): Promise<Result<{ id: string }>> {
  const inv = await getInvoiceFor(user, id);
  if (!inv || inv.issuerId !== user.id) return fail('Invoice not found');
  const today = startOfUtcDay(new Date());
  const days = Math.round((inv.dueDate.getTime() - inv.issueDate.getTime()) / 86_400_000);
  const copy = await db.$transaction(async (tx) => {
    const number = await nextNumber(tx, user.id);
    return tx.invoice.create({
      data: {
        kind: inv.kind,
        number,
        issuerId: user.id,
        clientId: inv.clientId,
        recipientId: inv.recipientId,
        issueDate: today,
        dueDate: new Date(today.getTime() + days * 86_400_000),
        currency: inv.currency,
        subtotalCents: inv.subtotalCents,
        discountType: inv.discountType,
        discountValue: inv.discountValue,
        discountCents: inv.discountCents,
        taxRate: inv.taxRate,
        taxCents: inv.taxCents,
        totalCents: inv.totalCents,
        notes: inv.notes,
        terms: inv.terms,
        remindersOn: inv.remindersOn,
        items: {
          create: inv.items.map(({ position, description, quantity, unitPriceCents, amountCents }) => ({
            position,
            description,
            quantity,
            unitPriceCents,
            amountCents,
          })),
        },
      },
    });
  });
  await logActivity(copy.id, user.id, 'created', `${user.name} duplicated ${inv.number} as ${copy.number}`);
  return { ok: true, data: { id: copy.id } };
}

export async function voidInvoice(user: User, id: string): Promise<Result> {
  const inv = await getInvoiceFor(user, id);
  if (!inv || !permissions(user, inv).canVoid) return fail('This invoice cannot be voided');
  await db.invoice.update({ where: { id }, data: { status: 'VOID', voidedAt: new Date() } });
  await logActivity(id, user.id, 'voided', `${user.name} voided the invoice`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Outgoing: email to client

export async function sendInvoiceEmail(user: User, id: string, opts: { message?: string; reminder?: boolean } = {}): Promise<Result> {
  const inv = await getInvoiceFor(user, id);
  if (!inv) return fail('Invoice not found');
  const p = permissions(user, inv);
  if (opts.reminder ? !p.canRemind : !p.canSend) return fail('This invoice cannot be sent');
  if (!inv.client) return fail('Invoice has no client');

  const res = await deliverInvoiceEmail(inv, { message: opts.message, reminder: opts.reminder });
  if (!res.ok) return res;

  if (opts.reminder) {
    await db.invoice.update({ where: { id }, data: { lastReminderAt: new Date(), reminderCount: { increment: 1 } } });
    await logActivity(id, user.id, 'reminder', `Reminder emailed to ${inv.client.email}`);
  } else {
    const status: InvoiceStatus = inv.status === 'DRAFT' ? 'SENT' : inv.status;
    await db.invoice.update({ where: { id }, data: { status, sentAt: new Date() } });
    await logActivity(id, user.id, 'sent', `${inv.sentAt ? 'Re-sent' : 'Sent'} to ${inv.client.email}`);
  }
  return { ok: true };
}

/** Shared by manual sends and the reminder cron. */
export async function deliverInvoiceEmail(inv: FullInvoice, opts: { message?: string; reminder?: boolean }): Promise<Result> {
  if (!inv.client) return fail('Invoice has no client');
  const daysOverdue = Math.max(0, Math.floor((startOfUtcDay(new Date()).getTime() - inv.dueDate.getTime()) / 86_400_000));
  const { subject, html } = opts.reminder
    ? reminderEmail(inv, daysOverdue, opts.message || null)
    : invoiceEmail(inv, opts.message || null);
  const pdf = await renderInvoicePdf(inv);
  const cc = (inv.client.ccEmails ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return sendEmail({
    to: inv.client.email,
    cc,
    replyTo: inv.issuer.email,
    subject,
    html,
    attachments: [{ filename: `${inv.number}.pdf`, content: pdf }],
  });
}

export async function markSentManually(user: User, id: string): Promise<Result> {
  const inv = await getInvoiceFor(user, id);
  if (!inv || inv.issuerId !== user.id || inv.kind !== 'OUTGOING' || inv.status !== 'DRAFT') return fail('Cannot mark as sent');
  await db.invoice.update({ where: { id }, data: { status: 'SENT', sentAt: new Date() } });
  await logActivity(id, user.id, 'sent', `${user.name} marked the invoice as sent (not emailed)`);
  return { ok: true };
}

/** Called when the hosted link is opened. Ignores views by the issuer. */
export async function recordView(token: string, viewerId: string | null) {
  const inv = await db.invoice.findUnique({ where: { publicToken: token } });
  if (!inv || inv.status === 'DRAFT' || viewerId === inv.issuerId) return;
  const first = !inv.viewedAt;
  await db.invoice.update({
    where: { id: inv.id },
    data: {
      viewCount: { increment: 1 },
      viewedAt: inv.viewedAt ?? new Date(),
      status: inv.status === 'SENT' ? 'VIEWED' : inv.status,
    },
  });
  if (first) await logActivity(inv.id, null, 'viewed', 'Client opened the invoice for the first time');
}

// ---------------------------------------------------------------------------
// Internal: freelancer → recipient approval flow

export async function submitInvoice(user: User, id: string): Promise<Result> {
  const inv = await getInvoiceFor(user, id);
  if (!inv || !permissions(user, inv).canSubmit || !inv.recipient) return fail('This invoice cannot be submitted');
  await db.invoice.update({
    where: { id },
    data: { status: 'SUBMITTED', submittedAt: new Date(), rejectedAt: null, rejectionReason: null },
  });
  await logActivity(id, user.id, 'submitted', `${user.name} submitted the invoice to ${inv.recipient.name}`);
  const mail = noticeEmail({
    eyebrow: inv.status === 'REJECTED' ? 'Invoice resubmitted' : 'New invoice to review',
    title: `${issuerName(inv.issuer)} sent you invoice ${inv.number}`,
    intro: `${inv.issuer.name} submitted an invoice for ${formatMoney(inv.totalCents, inv.currency)}. Review it and approve or send it back.`,
    rows: [
      ['From', issuerName(inv.issuer)],
      ['Amount', formatMoney(inv.totalCents, inv.currency)],
      ['Due', inv.dueDate.toISOString().slice(0, 10)],
    ],
    cta: { label: 'Review invoice', href: appUrl(`/invoices/${id}`) },
  });
  await sendEmail({ to: inv.recipient.email, replyTo: inv.issuer.email, ...mail });
  return { ok: true };
}

export async function reviewInvoice(user: User, id: string, decision: 'approve' | 'reject', reason?: string): Promise<Result> {
  const inv = await getInvoiceFor(user, id);
  if (!inv || !permissions(user, inv).canReview) return fail('This invoice is not awaiting your approval');
  if (decision === 'reject' && !reason?.trim()) return fail('Tell them why so they can fix it');

  if (decision === 'approve') {
    await db.invoice.update({ where: { id }, data: { status: 'APPROVED', approvedAt: new Date() } });
    await logActivity(id, user.id, 'approved', `${user.name} approved the invoice`);
  } else {
    await db.invoice.update({
      where: { id },
      data: { status: 'REJECTED', rejectedAt: new Date(), rejectionReason: reason!.trim() },
    });
    await logActivity(id, user.id, 'rejected', `${user.name} sent it back: ${reason!.trim()}`);
  }

  const approved = decision === 'approve';
  const mail = noticeEmail({
    eyebrow: approved ? 'Invoice approved' : 'Changes requested',
    title: approved
      ? `${user.name} approved invoice ${inv.number}`
      : `${user.name} sent back invoice ${inv.number}`,
    intro: approved
      ? `Good news! Your invoice for ${formatMoney(inv.totalCents, inv.currency)} was approved and is queued for payment.`
      : `Your invoice needs changes before it can be approved.\n\nReason: ${reason!.trim()}`,
    tone: approved ? 'success' : 'danger',
    cta: { label: approved ? 'View invoice' : 'Edit and resubmit', href: appUrl(`/invoices/${id}`) },
  });
  await sendEmail({ to: inv.issuer.email, replyTo: user.email, ...mail });
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Payments

export const paymentInput = z.object({
  amount: z.coerce.number().finite().positive('Enter an amount'),
  method: z.enum(['BANK_TRANSFER', 'WISE', 'PAYPAL', 'OTHER']),
  paidAt: z.string().date(),
  reference: z.string().trim().max(200).optional(),
  note: z.string().trim().max(1000).optional(),
  sendReceipt: z.boolean().optional(),
});

async function refreshPaid(invoiceId: string) {
  const inv = await db.invoice.findUniqueOrThrow({ where: { id: invoiceId }, include: { payments: true } });
  const paidCents = inv.payments.reduce((s, p) => s + p.amountCents, 0);
  const status = statusAfterPayment(inv, paidCents, inv.totalCents);
  const lastPaid = inv.payments.reduce<Date | null>((d, p) => (!d || p.paidAt > d ? p.paidAt : d), null);
  await db.invoice.update({
    where: { id: invoiceId },
    data: { paidCents, status, paidAt: status === 'PAID' ? lastPaid : null },
  });
  return status;
}

export async function recordPayment(user: User, id: string, raw: unknown): Promise<Result> {
  const inv = await getInvoiceFor(user, id);
  if (!inv || !permissions(user, inv).canRecordPayment) return fail('You cannot record a payment on this invoice');
  const parsed = paymentInput.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payment');
  const v = parsed.data;
  const amountCents = toCents(v.amount);
  const balance = inv.totalCents - inv.paidCents;
  if (amountCents > balance) return fail(`That's more than the balance due (${formatMoney(balance, inv.currency)})`);

  const payment = await db.payment.create({
    data: {
      invoiceId: id,
      amountCents,
      method: v.method as PaymentMethod,
      paidAt: new Date(v.paidAt),
      reference: v.reference || null,
      note: v.note || null,
      recordedById: user.id,
    },
  });
  const status = await refreshPaid(id);
  await logActivity(
    id,
    user.id,
    'payment',
    `${formatMoney(amountCents, inv.currency)} received via ${METHOD_LABEL[payment.method]}${payment.reference ? ` (ref ${payment.reference})` : ''}`,
  );

  const fresh = (await getInvoiceFor(user, id))!;
  if (inv.kind === 'OUTGOING' && v.sendReceipt && inv.client) {
    const mail = receiptEmail(fresh, payment);
    await sendEmail({ to: inv.client.email, replyTo: inv.issuer.email, ...mail });
    await logActivity(id, user.id, 'receipt', `Receipt emailed to ${inv.client.email}`);
  }
  if (inv.kind === 'INTERNAL') {
    const paidInFull = status === 'PAID';
    const mail = noticeEmail({
      eyebrow: paidInFull ? 'Paid in full' : 'Payment sent',
      title: `${user.name} paid ${formatMoney(amountCents, inv.currency)} on invoice ${inv.number}`,
      intro: paidInFull
        ? 'Your invoice is now fully paid. Thanks for your work!'
        : `A partial payment was sent. Remaining balance: ${formatMoney(fresh.totalCents - fresh.paidCents, inv.currency)}.`,
      rows: [
        ['Method', METHOD_LABEL[payment.method]],
        ['Date', v.paidAt],
        ...(payment.reference ? ([['Reference', payment.reference]] as [string, string][]) : []),
      ],
      tone: 'success',
      cta: { label: 'View invoice', href: appUrl(`/invoices/${id}`) },
    });
    await sendEmail({ to: inv.issuer.email, replyTo: user.email, ...mail });
  }
  return { ok: true };
}

export async function deletePayment(user: User, paymentId: string): Promise<Result> {
  const payment = await db.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return fail('Payment not found');
  const inv = await getInvoiceFor(user, payment.invoiceId);
  if (!inv || !permissions(user, inv).canDeletePayment) return fail('You cannot remove this payment');
  await db.payment.delete({ where: { id: paymentId } });
  await refreshPaid(inv.id);
  await logActivity(inv.id, user.id, 'payment_removed', `${user.name} removed a ${formatMoney(payment.amountCents, inv.currency)} payment`);
  return { ok: true };
}
