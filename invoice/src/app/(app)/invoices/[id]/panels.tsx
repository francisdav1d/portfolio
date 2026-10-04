'use client';

import { useActionState, useState } from 'react';
import { Check, Copy, Mail, X } from 'lucide-react';
import { Alert, btn, Card, CardHeader, Field, Input, Select, Textarea } from '@/components/ui';
import { ActionForm, SubmitButton } from '@/components/form';
import { paymentAction, reviewAction, sendAction } from '../actions';

export function SendPanel({
  id,
  to,
  cc,
  reminder,
  defaultOpen,
  resend,
}: {
  id: string;
  to: string;
  cc: string | null;
  reminder?: boolean;
  defaultOpen?: boolean;
  resend?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [state, action] = useActionState(sendAction, undefined);
  const label = reminder ? 'Send reminder' : resend ? 'Resend invoice' : 'Send invoice';

  if (!open) {
    return (
      <button type="button" className={reminder || resend ? btn.secondary : btn.primary} onClick={() => setOpen(true)}>
        <Mail className="size-4" /> {label}
      </button>
    );
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-900/40 p-4 sm:items-center" onClick={() => setOpen(false)}>
      <Card className="w-full max-w-lg">
        <div onClick={(e) => e.stopPropagation()}>
          <CardHeader
            title={label}
            subtitle="Your client gets a styled email with a link to the invoice and the PDF attached."
            action={
              <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100">
                <X className="size-4" />
              </button>
            }
          />
          <ActionForm action={action} className="space-y-4 p-5">
            <input type="hidden" name="id" value={id} />
            {reminder ? <input type="hidden" name="reminder" value="1" /> : null}
            {state?.error ? <Alert>{state.error}</Alert> : null}
            <div className="rounded-lg bg-zinc-50 px-3 py-2 text-sm">
              <span className="text-zinc-500">To:</span> {to}
              {cc ? (
                <span className="block text-xs text-zinc-500">
                  CC: {cc}
                </span>
              ) : null}
            </div>
            <Field label="Personal message (optional)">
              <Textarea
                name="message"
                rows={4}
                placeholder={
                  reminder
                    ? 'Leave blank for a friendly default reminder.'
                    : 'e.g. Thanks for a great month! Here’s the invoice for October.'
                }
              />
            </Field>
            <div className="flex justify-end gap-2">
              <button type="button" className={btn.ghost} onClick={() => setOpen(false)}>
                Cancel
              </button>
              <SubmitButton pendingText="Sending…">
                <Mail className="size-4" /> {label}
              </SubmitButton>
            </div>
          </ActionForm>
        </div>
      </Card>
    </div>
  );
}

export function ReviewPanel({ id, issuerName }: { id: string; issuerName: string }) {
  const [rejecting, setRejecting] = useState(false);
  const [state, action] = useActionState(reviewAction, undefined);
  return (
    <Card className="border-l-4 border-l-amber-400">
      <div className="p-5">
        <p className="font-semibold">{issuerName} is waiting for your approval</p>
        <p className="mt-1 text-sm text-zinc-500">
          Approving tells them it’s accepted and queued for payment. Sending it back lets them fix it and resubmit.
        </p>
        {state?.error ? (
          <div className="mt-3">
            <Alert>{state.error}</Alert>
          </div>
        ) : null}
        {rejecting ? (
          <ActionForm action={action} className="mt-4 space-y-3">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="decision" value="reject" />
            <Field label="What needs to change?">
              <Textarea name="reason" rows={3} required autoFocus placeholder="e.g. Hours for week 2 should be 32, not 40." />
            </Field>
            <div className="flex gap-2">
              <SubmitButton variant="danger">Send back</SubmitButton>
              <button type="button" className={btn.ghost} onClick={() => setRejecting(false)}>
                Cancel
              </button>
            </div>
          </ActionForm>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            <ActionForm action={action}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="decision" value="approve" />
              <SubmitButton variant="success">
                <Check className="size-4" /> Approve
              </SubmitButton>
            </ActionForm>
            <button type="button" className={btn.danger} onClick={() => setRejecting(true)}>
              Send back
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

export function PaymentForm({
  id,
  balance,
  currency,
  outgoing,
}: {
  id: string;
  balance: number;
  currency: string;
  outgoing: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(paymentAction, undefined);
  if (!open) {
    return (
      <button type="button" className={`${btn.success} w-full`} onClick={() => setOpen(true)}>
        {outgoing ? 'Record payment' : 'Mark as paid'}
      </button>
    );
  }
  return (
    <ActionForm action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      {state?.error ? <Alert>{state.error}</Alert> : null}
      <div className="grid grid-cols-2 gap-3">
        <Field label={`Amount (${currency})`}>
          <Input name="amount" inputMode="decimal" defaultValue={(balance / 100).toFixed(2)} required />
        </Field>
        <Field label="Date">
          <Input name="paidAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
        </Field>
      </div>
      <Field label="Method">
        <Select name="method" defaultValue="BANK_TRANSFER">
          <option value="BANK_TRANSFER">Bank transfer</option>
          <option value="WISE">Wise</option>
          <option value="PAYPAL">PayPal</option>
          <option value="OTHER">Other</option>
        </Select>
      </Field>
      <Field label="Reference" hint="Wire reference, Wise transfer #, PayPal transaction ID">
        <Input name="reference" />
      </Field>
      <Field label="Note">
        <Input name="note" />
      </Field>
      {outgoing ? (
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input type="checkbox" name="sendReceipt" className="size-4 rounded border-zinc-300" />
          Email a receipt to the client
        </label>
      ) : null}
      <div className="flex gap-2">
        <SubmitButton variant="success" className="flex-1">
          Save payment
        </SubmitButton>
        <button type="button" className={btn.ghost} onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </ActionForm>
  );
}

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={`${btn.secondary} w-full`}
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
      {copied ? 'Copied' : 'Copy client link'}
    </button>
  );
}
