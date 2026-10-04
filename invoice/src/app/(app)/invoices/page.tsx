import { Plus } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { LinkButton, PageHeader } from '@/components/ui';
import { InvoiceList } from './invoice-list';

export const metadata = { title: 'Invoices' };

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string }> }) {
  const user = await requireUser();
  const owner = user.role === 'OWNER';
  return (
    <>
      <PageHeader
        title={owner ? 'Invoices' : 'My invoices'}
        subtitle={owner ? 'Invoices you send to your clients.' : 'Invoices you’ve sent for your work.'}
        actions={
          <LinkButton href="/invoices/new">
            <Plus className="size-4" /> New invoice
          </LinkButton>
        }
      />
      <InvoiceList user={user} mode="issued" basePath="/invoices" params={await searchParams} />
    </>
  );
}
