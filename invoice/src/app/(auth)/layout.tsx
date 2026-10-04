import { FileText } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-zinc-50 px-4 py-12">
      <div className="mb-8 flex items-center gap-2.5">
        <div className="rounded-lg bg-brand-600 p-1.5 text-white">
          <FileText className="size-5" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Invoices</span>
      </div>
      <div className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-sm ring-1 ring-zinc-200">{children}</div>
    </div>
  );
}
