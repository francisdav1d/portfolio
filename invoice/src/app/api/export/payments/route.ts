import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { csvResponse, toCsv } from '@/lib/csv';
import { billTo, issuerName } from '@/lib/invoice-query';
import { METHOD_LABEL } from '@/lib/status';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  const dir = new URL(req.url).searchParams.get('dir') === 'out' ? 'out' : 'in';
  const payments = await db.payment.findMany({
    where: { invoice: dir === 'in' ? { issuerId: user.id } : { recipientId: user.id } },
    include: { invoice: { include: { client: true, recipient: true, issuer: true } } },
    orderBy: { paidAt: 'desc' },
  });
  const rows = [
    ['Date', 'Invoice', dir === 'in' ? 'From' : 'To', 'Method', 'Reference', 'Currency', 'Amount', 'Note'],
    ...payments.map((p) => [
      p.paidAt.toISOString().slice(0, 10),
      p.invoice.number,
      dir === 'in' ? billTo(p.invoice).name : issuerName(p.invoice.issuer),
      METHOD_LABEL[p.method],
      p.reference,
      p.invoice.currency,
      (p.amountCents / 100).toFixed(2),
      p.note,
    ]),
  ];
  return csvResponse(`payments-${dir === 'in' ? 'received' : 'paid-out'}-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows));
}
