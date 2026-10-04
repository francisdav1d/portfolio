import { notFound } from 'next/navigation';
import { Download, Printer } from 'lucide-react';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { fullInvoiceInclude, issuerName } from '@/lib/invoice-query';
import { recordView } from '@/lib/invoices';
import { InvoiceDocument } from '@/components/invoice-document';
import { PrintButton } from './print-button';

export const dynamic = 'force-dynamic';

async function load(token: string) {
  const inv = await db.invoice.findUnique({ where: { publicToken: token }, include: fullInvoiceInclude });
  // Drafts and internal invoices are never public.
  if (!inv || inv.kind !== 'OUTGOING' || inv.status === 'DRAFT') return null;
  return inv;
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const inv = await load((await params).token);
  return { title: inv ? `Invoice ${inv.number} from ${issuerName(inv.issuer)}` : 'Invoice' };
}

export default async function PublicInvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await load(token);
  if (!inv) notFound();

  const viewer = await getCurrentUser();
  await recordView(token, viewer?.id ?? null);

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-8 sm:py-12 print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl">
        <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-600">
            Invoice from <span className="font-semibold text-zinc-900">{issuerName(inv.issuer)}</span>
          </p>
          <div className="flex gap-2">
            <PrintButton>
              <Printer className="size-4" /> Print
            </PrintButton>
            <a
              href={`/i/${token}/pdf`}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
            >
              <Download className="size-4" /> Download PDF
            </a>
          </div>
        </div>
        <InvoiceDocument inv={inv} />
        <p className="no-print mt-6 text-center text-xs text-zinc-500">
          Questions about this invoice? Email{' '}
          <a href={`mailto:${inv.issuer.email}`} className="underline">
            {inv.issuer.email}
          </a>
        </p>
      </div>
    </div>
  );
}
