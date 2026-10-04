import { requireUser } from '@/lib/auth';
import { PageHeader } from '@/components/ui';
import { InvoiceList } from '../invoices/invoice-list';

export const metadata = { title: 'Inbox' };

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string }> }) {
  const user = await requireUser();
  return (
    <>
      <PageHeader title="Inbox" subtitle="Invoices sent to you. Approve them, then record payment once you’ve paid." />
      <InvoiceList user={user} mode="received" basePath="/inbox" params={await searchParams} defaultTab="review" />
    </>
  );
}
