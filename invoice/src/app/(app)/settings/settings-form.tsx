'use client';

import { useActionState } from 'react';
import type { User } from '@prisma/client';
import { Alert, Card, CardHeader, Field, Input, Select, Textarea } from '@/components/ui';
import { ActionForm, SubmitButton } from '@/components/form';
import { CURRENCIES } from '@/lib/money';
import { changePassword, saveSettings } from './actions';

type Props = { user: Omit<User, 'passwordHash'> };

export function SettingsForm({ user }: Props) {
  const [state, action] = useActionState(saveSettings, undefined);
  const v = (k: keyof Props['user']) => (user[k] ?? '') as string;

  return (
    <ActionForm action={action} className="space-y-6">
      {state?.error ? <Alert>{state.error}</Alert> : null}
      {state?.ok ? <Alert tone="success">{state.ok}</Alert> : null}

      <Card>
        <CardHeader title="Profile & business" subtitle="Shown in the “From” section of your invoices." />
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Your name">
            <Input name="name" defaultValue={v('name')} required />
          </Field>
          <Field label="Business name" hint="Optional. Shown instead of your name if set.">
            <Input name="businessName" defaultValue={v('businessName')} />
          </Field>
          <Field label="Phone">
            <Input name="phone" defaultValue={v('phone')} />
          </Field>
          <Field label="Tax ID / EIN">
            <Input name="taxId" defaultValue={v('taxId')} />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <Textarea name="address" rows={3} defaultValue={v('address')} />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="How you get paid"
          subtitle="Printed on every invoice and email so people know exactly where to send money."
        />
        <div className="space-y-6 p-5">
          <div>
            <p className="mb-3 text-sm font-semibold">Bank transfer (ACH / wire)</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Bank name">
                <Input name="bankName" defaultValue={v('bankName')} />
              </Field>
              <Field label="Account holder name">
                <Input name="bankAccountName" defaultValue={v('bankAccountName')} />
              </Field>
              <Field label="Account number">
                <Input name="bankAccountNumber" defaultValue={v('bankAccountNumber')} />
              </Field>
              <Field label="Routing number (ACH / wire)">
                <Input name="bankRouting" defaultValue={v('bankRouting')} />
              </Field>
              <Field label="SWIFT / BIC" hint="For international wires">
                <Input name="bankSwift" defaultValue={v('bankSwift')} />
              </Field>
              <Field label="Bank address">
                <Input name="bankAddress" defaultValue={v('bankAddress')} />
              </Field>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Wise email" hint="Email linked to your Wise account">
              <Input name="wiseEmail" type="email" defaultValue={v('wiseEmail')} />
            </Field>
            <Field label="PayPal email">
              <Input name="paypalEmail" type="email" defaultValue={v('paypalEmail')} />
            </Field>
            <Field label="Extra payment notes" className="sm:col-span-2" hint="e.g. “Bank transfer preferred for amounts over $2,000”">
              <Textarea name="paymentNotes" rows={2} defaultValue={v('paymentNotes')} />
            </Field>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Invoice defaults" />
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Default currency">
            <Select name="defaultCurrency" defaultValue={user.defaultCurrency}>
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Payment due (days)">
            <Input name="defaultDueDays" type="number" min={0} max={365} defaultValue={user.defaultDueDays} />
          </Field>
          <Field label="Number prefix">
            <Input name="invoicePrefix" defaultValue={user.invoicePrefix} />
          </Field>
          <Field label="Next number" hint={`Next: ${user.invoicePrefix}-${String(user.nextInvoiceNumber).padStart(4, '0')}`}>
            <Input name="nextInvoiceNumber" type="number" min={1} defaultValue={user.nextInvoiceNumber} />
          </Field>
          <Field label="Default terms" className="sm:col-span-2 lg:col-span-4">
            <Textarea name="defaultTerms" rows={2} defaultValue={v('defaultTerms')} placeholder="e.g. Payment due within 14 days. Thank you for your business!" />
          </Field>
        </div>
      </Card>

      <div className="flex justify-end">
        <SubmitButton pendingText="Saving…">Save settings</SubmitButton>
      </div>
    </ActionForm>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, undefined);
  return (
    <Card>
      <CardHeader title="Change password" />
      <ActionForm action={action} className="space-y-4 p-5">
        {state?.error ? <Alert>{state.error}</Alert> : null}
        {state?.ok ? <Alert tone="success">{state.ok}</Alert> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Current password">
            <Input name="current" type="password" autoComplete="current-password" required />
          </Field>
          <Field label="New password">
            <Input name="next" type="password" autoComplete="new-password" minLength={8} required />
          </Field>
        </div>
        <div className="flex justify-end">
          <SubmitButton variant="secondary">Update password</SubmitButton>
        </div>
      </ActionForm>
    </Card>
  );
}
