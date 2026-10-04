import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { csvResponse, toCsv } from '@/lib/csv';
import { billTo, issuerName } from '@/lib/invoice-query';
import { displayStatus, STATUS_LABEL } from '@/lib/status';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  const mode = new URL(req.url).searchParams.get('mode') === 'received' ? 'received' : 'issued';
  const invoices = await db.invoice.findMany({
    where: mode === 'issued' ? { issuerId: user.id } : { recipientId: user.id, status: { not: 'DRAFT' } },
    include: { client: true, recipient: true, issuer: true },
    orderBy: { issueDate: 'desc' },
  });
  const d = (x: Date | null) => (x ? x.toISOString().slice(0, 10) : '');
  const $ = (c: number) => (c / 100).toFixed(2);
  const rows = [
    ['Number', mode === 'issued' ? 'Billed to' : 'From', 'Email', 'Issue date', 'Due date', 'Currency', 'Subtotal', 'Discount', 'Tax', 'Total', 'Paid', 'Balance', 'Status', 'Paid on'],
    ...invoices.map((i) => {
      const party = mode === 'issued' ? billTo(i) : { name: issuerName(i.issuer), email: i.issuer.email };
      return [
        i.number,
        party.name,
        party.email,
        d(i.issueDate),
        d(i.dueDate),
        i.currency,
        $(i.subtotalCents),
        $(i.discountCents),
        $(i.taxCents),
        $(i.totalCents),
        $(i.paidCents),
        $(i.totalCents - i.paidCents),
        STATUS_LABEL[displayStatus(i)],
        d(i.paidAt),
      ];
    }),
  ];
  return csvResponse(`invoices-${mode}-${d(new Date())}.csv`, toCsv(rows));
}
