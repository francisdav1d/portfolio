import { db } from '@/lib/db';
import { fullInvoiceInclude } from '@/lib/invoice-query';
import { renderInvoicePdf } from '@/lib/pdf';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const inv = await db.invoice.findUnique({ where: { publicToken: (await params).token }, include: fullInvoiceInclude });
  if (!inv || inv.kind !== 'OUTGOING' || inv.status === 'DRAFT') return new Response('Not found', { status: 404 });
  const pdf = await renderInvoicePdf(inv);
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${inv.number}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
