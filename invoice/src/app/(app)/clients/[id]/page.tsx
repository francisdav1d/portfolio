import { notFound } from 'next/navigation';
import { Plus } from 'lucide-react';
import { requireOwner } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatMoney } from '@/lib/money';
import { isOpen, isOverdue } from '@/lib/status';
import { Card, CardHeader, LinkButton, PageHeader, Stat } from '@/components/ui';
import { ActionButton } from '@/components/form';
import { InvoiceTable } from '../../invoices/invoice-table';
import { ClientForm } from '../client-form';
import { setArchived } from '../actions';

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireOwner();
  const { id } = await params;
  const client = await db.client.findFirst({
    where: { id, ownerId: user.id },
    include: { invoices: { orderBy: { issueDate: 'desc' }, include: { client: true, recipient: true, issuer: true } } },
  });
  if (!client) notFound();

  const open = client.invoices.filter((i) => isOpen(i.status));
  const outstanding = open.reduce((s, i) => s + i.totalCents - i.paidCents, 0);
  const overdue = open.filter((i) => isOverdue(i)).reduce((s, i) => s + i.totalCents - i.paidCents, 0);
  const paid = client.invoices.reduce((s, i) => s + i.paidCents, 0);

  return (
    <>
      <PageHeader
        title={client.company || client.name}
        subtitle={client.email}
        actions={
          <>
            <ActionButton
              action={setArchived}
              fields={{ id: client.id, archived: String(!client.archived) }}
              variant="ghost"
            >
              {client.archived ? 'Unarchive' : 'Archive'}
            </ActionButton>
            <LinkButton href={`/invoices/new?client=${client.id}`}>
              <Plus className="size-4" /> New invoice
            </LinkButton>
          </>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Outstanding" value={formatMoney(outstanding, client.currency)} sub={`${open.length} open invoices`} />
        <Stat label="Overdue" value={formatMoney(overdue, client.currency)} tone={overdue ? 'danger' : undefined} />
        <Stat label="Paid to date" value={formatMoney(paid, client.currency)} tone="success" />
      </div>
      <Card className="mb-6">
        <CardHeader title="Invoices" />
        <InvoiceTable invoices={client.invoices} perspective="issuer" empty="No invoices for this client yet." />
      </Card>
      <Card>
        <CardHeader title="Client details" />
        <div className="p-5">
          <ClientForm client={client} />
        </div>
      </Card>
    </>
  );
}
