import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { Sidebar } from './sidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const pending = await db.invoice.count({ where: { recipientId: user.id, status: 'SUBMITTED' } });

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar
        user={{ name: user.name, email: user.email, role: user.role }}
        pendingCount={pending}
      />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
