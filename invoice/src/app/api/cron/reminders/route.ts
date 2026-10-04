import { db } from '@/lib/db';
import { fullInvoiceInclude } from '@/lib/invoice-query';
import { deliverInvoiceEmail, logActivity } from '@/lib/invoices';
import { startOfUtcDay } from '@/lib/status';

export const runtime = 'nodejs';
export const maxDuration = 60;

const DAY = 86_400_000;
// Remind 3 days before due, then every 7 days once overdue, at most 6 times in total.
const BEFORE_DUE_DAYS = 3;
const OVERDUE_EVERY_DAYS = 7;
const MAX_REMINDERS = 6;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const today = startOfUtcDay(new Date());
  const candidates = await db.invoice.findMany({
    where: {
      kind: 'OUTGOING',
      remindersOn: true,
      status: { in: ['SENT', 'VIEWED', 'PARTIAL'] },
      reminderCount: { lt: MAX_REMINDERS },
      dueDate: { lte: new Date(today.getTime() + BEFORE_DUE_DAYS * DAY) },
    },
    include: fullInvoiceInclude,
  });

  const results: { number: string; ok: boolean; error?: string }[] = [];
  for (const inv of candidates) {
    const daysToDue = Math.round((inv.dueDate.getTime() - today.getTime()) / DAY);
    const sinceLast = inv.lastReminderAt ? (today.getTime() - startOfUtcDay(inv.lastReminderAt).getTime()) / DAY : Infinity;

    const upcomingDue = daysToDue === BEFORE_DUE_DAYS && !inv.lastReminderAt;
    const overdueDue = daysToDue < 0 && sinceLast >= OVERDUE_EVERY_DAYS;
    if (!upcomingDue && !overdueDue) continue;

    const res = await deliverInvoiceEmail(inv, { reminder: true });
    if (res.ok) {
      await db.invoice.update({
        where: { id: inv.id },
        data: { lastReminderAt: new Date(), reminderCount: { increment: 1 } },
      });
      await logActivity(inv.id, null, 'reminder', `Automatic reminder emailed to ${inv.client?.email}`);
    }
    results.push({ number: inv.number, ok: res.ok, error: res.ok ? undefined : res.error });
  }

  return Response.json({ checked: candidates.length, sent: results });
}
