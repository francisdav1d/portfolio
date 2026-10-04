import { getCurrentUser } from '@/lib/auth';
import { getInvoiceFor } from '@/lib/invoices';
import { renderInvoicePdf } from '@/lib/pdf';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  const inv = await getInvoiceFor(user, (await params).id);
  if (!inv) return new Response('Not found', { status: 404 });
  const pdf = await renderInvoicePdf(inv);
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${inv.number}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
