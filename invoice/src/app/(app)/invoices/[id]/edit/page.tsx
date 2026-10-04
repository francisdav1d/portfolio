import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { getInvoiceFor, permissions } from '@/lib/invoices';
import { PageHeader } from '@/components/ui';
import { InvoiceEditor } from '../../invoice-editor';
import { editorOptions, nextNumberHint } from '../../editor-data';

export const metadata = { title: 'Edit invoice' };

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const inv = await getInvoiceFor(user, id);
  if (!inv) notFound();
  if (!permissions(user, inv).canEdit) redirect(`/invoices/${id}`);
  const opts = await editorOptions(user);

  // Keep an archived client selectable when editing an older invoice.
  if (inv.client && !opts.clients.some((c) => c.id === inv.clientId)) {
    const { id: cid, name, company, email, currency } = inv.client;
    opts.clients.push({ id: cid, name, company, email, currency });
  }

  const money = (cents: number) => (cents / 100).toFixed(2);
  return (
    <>
      <PageHeader title={`Edit ${inv.number}`} />
      <InvoiceEditor
        kind={inv.kind}
        status={inv.status}
        clients={opts.clients}
        recipients={opts.recipients}
        nextNumberHint={nextNumberHint(user)}
        initial={{
          id: inv.id,
          number: inv.number,
          clientId: inv.clientId ?? '',
          recipientId: inv.recipientId ?? '',
          issueDate: inv.issueDate.toISOString().slice(0, 10),
          dueDate: inv.dueDate.toISOString().slice(0, 10),
          currency: inv.currency,
          items: inv.items.map((i) => ({
            description: i.description,
            quantity: String(i.quantity),
            unitPrice: money(i.unitPriceCents),
          })),
          discountType: inv.discountType === 'AMOUNT' ? 'AMOUNT' : 'PERCENT',
          discountValue: inv.discountValue
            ? inv.discountType === 'AMOUNT'
              ? money(inv.discountValue)
              : String(inv.discountValue)
            : '',
          taxRate: inv.taxRate ? String(inv.taxRate) : '',
          notes: inv.notes ?? '',
          terms: inv.terms ?? '',
          remindersOn: inv.remindersOn,
        }}
      />
    </>
  );
}
