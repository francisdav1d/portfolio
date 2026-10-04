import { requireUser } from '@/lib/auth';
import { Card, EmptyState, LinkButton, PageHeader } from '@/components/ui';
import { InvoiceEditor } from '../invoice-editor';
import { editorOptions, nextNumberHint, todayIso } from '../editor-data';

export const metadata = { title: 'New invoice' };

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  const user = await requireUser();
  const { client } = await searchParams;
  const opts = await editorOptions(user);

  if (opts.kind === 'OUTGOING' && opts.clients.length === 0) {
    return (
      <>
        <PageHeader title="New invoice" />
        <Card>
          <EmptyState
            title="Add a client first"
            body="Invoices are sent to a client’s email, so you’ll need at least one."
            action={<LinkButton href="/clients/new?returnTo=invoice">Add a client</LinkButton>}
          />
        </Card>
      </>
    );
  }
  if (opts.kind === 'INTERNAL' && opts.recipients.length === 0) {
    return (
      <>
        <PageHeader title="New invoice" />
        <Card>
          <EmptyState title="No one to bill yet" body="There are no other accounts on this platform to send an invoice to." />
        </Card>
      </>
    );
  }

  const preset = opts.clients.find((c) => c.id === client);
  const issueDate = todayIso();
  const due = new Date(issueDate + 'T00:00:00Z');
  due.setUTCDate(due.getUTCDate() + user.defaultDueDays);

  return (
    <>
      <PageHeader title="New invoice" />
      <InvoiceEditor
        kind={opts.kind}
        clients={opts.clients}
        recipients={opts.recipients}
        nextNumberHint={nextNumberHint(user)}
        initial={{
          number: '',
          clientId: preset?.id ?? '',
          recipientId: opts.defaultRecipientId,
          issueDate,
          dueDate: due.toISOString().slice(0, 10),
          currency: preset?.currency ?? user.defaultCurrency,
          items: [{ description: '', quantity: '1', unitPrice: '' }],
          discountType: 'PERCENT',
          discountValue: '',
          taxRate: '',
          notes: '',
          terms: user.defaultTerms ?? '',
          remindersOn: true,
        }}
      />
    </>
  );
}
