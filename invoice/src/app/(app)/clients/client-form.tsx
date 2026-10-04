'use client';

import { useActionState } from 'react';
import type { Client } from '@prisma/client';
import { Alert, Field, Input, Select, Textarea } from '@/components/ui';
import { ActionForm, SubmitButton } from '@/components/form';
import { CURRENCIES } from '@/lib/money';
import { saveClient } from './actions';

export function ClientForm({
  client,
  defaultCurrency = 'USD',
  returnTo,
}: {
  client?: Client;
  defaultCurrency?: string;
  returnTo?: string;
}) {
  const [state, action] = useActionState(saveClient, undefined);
  return (
    <ActionForm action={action} className="space-y-4">
      {client ? <input type="hidden" name="id" value={client.id} /> : null}
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
      {state?.error ? <Alert>{state.error}</Alert> : null}
      {state?.ok ? <Alert tone="success">{state.ok}</Alert> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Contact name">
          <Input name="name" defaultValue={client?.name} required />
        </Field>
        <Field label="Company">
          <Input name="company" defaultValue={client?.company ?? ''} />
        </Field>
        <Field label="Email" hint="Invoices are sent here">
          <Input name="email" type="email" defaultValue={client?.email} required />
        </Field>
        <Field label="CC emails" hint="Optional, comma separated (e.g. their accounts payable team)">
          <Input name="ccEmails" defaultValue={client?.ccEmails ?? ''} />
        </Field>
        <Field label="Phone">
          <Input name="phone" defaultValue={client?.phone ?? ''} />
        </Field>
        <Field label="Currency">
          <Select name="currency" defaultValue={client?.currency ?? defaultCurrency}>
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Billing address" className="sm:col-span-2">
          <Textarea name="address" rows={3} defaultValue={client?.address ?? ''} />
        </Field>
        <Field label="Tax ID">
          <Input name="taxId" defaultValue={client?.taxId ?? ''} />
        </Field>
        <Field label="Private notes" hint="Only you see these">
          <Input name="notes" defaultValue={client?.notes ?? ''} />
        </Field>
      </div>
      <div className="flex justify-end">
        <SubmitButton>{client ? 'Save client' : 'Add client'}</SubmitButton>
      </div>
    </ActionForm>
  );
}
