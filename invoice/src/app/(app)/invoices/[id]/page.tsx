import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Copy as CopyIcon, Download, ExternalLink, Pencil, Send, Trash2 } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getInvoiceFor, permissions } from '@/lib/invoices';
import { billTo, issuerName } from '@/lib/invoice-query';
import { formatDate, formatMoney } from '@/lib/money';
import { appUrl } from '@/lib/email/send';
import { displayStatus, METHOD_LABEL } from '@/lib/status';
import { Alert, Card, CardHeader, LinkButton, StatusBadge } from '@/components/ui';
import { ActionButton } from '@/components/form';
import { InvoiceDocument } from '@/components/invoice-document';
import {
  deleteAction,
  deletePaymentAction,
  duplicateAction,
  markSentAction,
  submitAction,
  voidAction,
} from '../actions';
import { CopyLink, PaymentForm, ReviewPanel, SendPanel } from './panels';

const FLASH: Record<string, string> = {
  saved: 'Invoice saved.',
  sent: 'Invoice emailed to your client.',
  reminded: 'Reminder sent.',
  submitted: 'Invoice submitted. They’ll get an email to review it.',
  approved: 'Approved. They’ve been notified.',
  rejected: 'Sent back with your note.',
  paid: 'Payment recorded.',
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const inv = await db.invoice.findUnique({ where: { id: (await params).id }, select: { number: true } });
  return { title: inv?.number ?? 'Invoice' };
}

export default async function InvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ flash?: string; send?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { flash, send } = await searchParams;
  const inv = await getInvoiceFor(user, id);
  if (!inv) notFound();

  const p = permissions(user, inv);
  const outgoing = inv.kind === 'OUTGOING';
  const balance = inv.totalCents - inv.paidCents;
  const status = displayStatus(inv);
  const activity = await db.activity.findMany({ where: { invoiceId: id }, orderBy: { createdAt: 'desc' }, take: 50 });
  const publicUrl = appUrl(`/i/${inv.publicToken}`);
  const backHref = p.isRecipient ? '/inbox' : '/invoices';

  return (
    <>
      <Link href={backHref} className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800">
        <ArrowLeft className="size-4" /> {p.isRecipient ? 'Inbox' : 'Invoices'}
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{inv.number}</h1>
            <StatusBadge status={status} />
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            {p.isRecipient ? `From ${issuerName(inv.issuer)}` : `To ${billTo(inv).name}`} ·{' '}
            {formatMoney(inv.totalCents, inv.currency)} · due {formatDate(inv.dueDate)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {p.canEdit ? (
            <LinkButton variant="secondary" href={`/invoices/${id}/edit`}>
              <Pencil className="size-4" /> Edit
            </LinkButton>
          ) : null}
          <a href={`/api/invoices/${id}/pdf`} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100">
            <Download className="size-4" /> PDF
          </a>
          {p.canSend && inv.client ? (
            <SendPanel
              id={id}
              to={inv.client.email}
              cc={inv.client.ccEmails}
              defaultOpen={send === '1'}
              resend={inv.status !== 'DRAFT'}
            />
          ) : null}
          {p.canRemind && inv.client ? <SendPanel id={id} to={inv.client.email} cc={inv.client.ccEmails} reminder /> : null}
          {p.canSubmit ? (
            <ActionButton action={submitAction} fields={{ id }} variant="primary">
              <Send className="size-4" /> {inv.status === 'REJECTED' ? 'Resubmit' : 'Submit'} to {inv.recipient?.name}
            </ActionButton>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        {flash && FLASH[flash] ? <Alert tone="success">{FLASH[flash]}</Alert> : null}
        {inv.status === 'REJECTED' && inv.rejectionReason ? (
          <Alert>
            <strong>Sent back{p.isIssuer ? ' to you' : ''}:</strong> {inv.rejectionReason}
          </Alert>
        ) : null}
        {p.canReview ? <ReviewPanel id={id} issuerName={issuerName(inv.issuer)} /> : null}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <InvoiceDocument inv={inv} />
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader title="Summary" />
            <dl className="space-y-2 p-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Total</dt>
                <dd className="tabular">{formatMoney(inv.totalCents, inv.currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Paid</dt>
                <dd className="tabular text-emerald-600">{formatMoney(inv.paidCents, inv.currency)}</dd>
              </div>
              <div className="flex justify-between border-t border-zinc-100 pt-2 font-semibold">
                <dt>Balance</dt>
                <dd className="tabular">{formatMoney(balance, inv.currency)}</dd>
              </div>
              {outgoing && inv.status !== 'DRAFT' ? (
                <div className="flex justify-between pt-2 text-xs text-zinc-500">
                  <dt>Client views</dt>
                  <dd>{inv.viewCount ? `${inv.viewCount} · first ${formatDate(inv.viewedAt)}` : 'Not opened yet'}</dd>
                </div>
              ) : null}
            </dl>
            {p.canRecordPayment ? (
              <div className="border-t border-zinc-100 p-5">
                <PaymentForm id={id} balance={balance} currency={inv.currency} outgoing={outgoing} />
              </div>
            ) : null}
          </Card>

          <Card>
            <CardHeader title="Payments" />
            {inv.payments.length ? (
              <ul className="divide-y divide-zinc-100">
                {inv.payments.map((pay) => (
                  <li key={pay.id} className="flex items-start justify-between gap-3 px-5 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="tabular font-medium">{formatMoney(pay.amountCents, inv.currency)}</p>
                      <p className="text-xs text-zinc-500">
                        {METHOD_LABEL[pay.method]} · {formatDate(pay.paidAt)}
                      </p>
                      {pay.reference ? <p className="truncate text-xs text-zinc-500">Ref: {pay.reference}</p> : null}
                      {pay.note ? <p className="text-xs text-zinc-500">{pay.note}</p> : null}
                    </div>
                    {p.canDeletePayment ? (
                      <ActionButton
                        action={deletePaymentAction}
                        fields={{ id, paymentId: pay.id }}
                        confirm="Remove this payment?"
                        variant="ghost"
                        className="!p-1.5"
                      >
                        <Trash2 className="size-3.5" />
                      </ActionButton>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-4 text-sm text-zinc-500">No payments yet.</p>
            )}
          </Card>

          {p.isIssuer ? (
            <Card>
              <CardHeader title="More" />
              <div className="space-y-2 p-5">
                {outgoing && inv.status !== 'DRAFT' ? (
                  <>
                    <CopyLink url={publicUrl} />
                    <a href={publicUrl} target="_blank" className="flex items-center justify-center gap-2 py-1 text-xs text-zinc-500 hover:text-zinc-800">
                      Preview what your client sees <ExternalLink className="size-3" />
                    </a>
                  </>
                ) : null}
                {outgoing && inv.status === 'DRAFT' ? (
                  <ActionButton action={markSentAction} fields={{ id }} className="w-full">
                    Mark as sent (without emailing)
                  </ActionButton>
                ) : null}
                <ActionButton action={duplicateAction} fields={{ id }} className="w-full">
                  <CopyIcon className="size-4" /> Duplicate
                </ActionButton>
                {p.canVoid && inv.status !== 'DRAFT' ? (
                  <ActionButton action={voidAction} fields={{ id }} variant="danger" className="w-full" confirm="Void this invoice? It will no longer count as owed.">
                    {outgoing ? 'Void invoice' : 'Withdraw invoice'}
                  </ActionButton>
                ) : null}
                {p.canDelete ? (
                  <ActionButton action={deleteAction} fields={{ id }} variant="danger" className="w-full" confirm="Delete this draft permanently?">
                    <Trash2 className="size-4" /> Delete draft
                  </ActionButton>
                ) : null}
              </div>
            </Card>
          ) : null}

          <Card>
            <CardHeader title="Activity" />
            <ol className="space-y-3 p-5">
              {activity.map((a) => (
                <li key={a.id} className="relative pl-4 text-sm before:absolute before:left-0 before:top-2 before:size-1.5 before:rounded-full before:bg-zinc-300">
                  <p className="text-zinc-700">{a.message}</p>
                  <p className="text-xs text-zinc-400">
                    {a.createdAt.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </aside>
      </div>
    </>
  );
}
