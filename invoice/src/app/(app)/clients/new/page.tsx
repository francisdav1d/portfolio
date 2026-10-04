import { requireOwner } from '@/lib/auth';
import { Card, PageHeader } from '@/components/ui';
import { ClientForm } from '../client-form';

export const metadata = { title: 'New client' };

export default async function NewClientPage({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const user = await requireOwner();
  const { returnTo } = await searchParams;
  return (
    <>
      <PageHeader title="New client" />
      <Card className="p-5">
        <ClientForm defaultCurrency={user.defaultCurrency} returnTo={returnTo} />
      </Card>
    </>
  );
}
