import Link from 'next/link';
import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';
import { STATUS_LABEL, STATUS_STYLE, type DisplayStatus } from '@/lib/status';

export { clsx as cx };

const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap';

export const btn = {
  primary: `${btnBase} bg-brand-600 text-white hover:bg-brand-700 px-3.5 py-2 shadow-sm`,
  secondary: `${btnBase} bg-white text-zinc-800 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 px-3.5 py-2 shadow-sm`,
  ghost: `${btnBase} text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 px-3 py-2`,
  danger: `${btnBase} bg-white text-rose-600 ring-1 ring-inset ring-rose-200 hover:bg-rose-50 px-3.5 py-2`,
  success: `${btnBase} bg-emerald-600 text-white hover:bg-emerald-700 px-3.5 py-2 shadow-sm`,
};

export function LinkButton({
  variant = 'primary',
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: keyof typeof btn }) {
  return <Link className={clsx(btn[variant], className)} {...props} />;
}

export const inputClass =
  'block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-brand-600';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={clsx(inputClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={clsx(inputClass, 'min-h-[80px]', className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return <select className={clsx(inputClass, 'pr-8', className)} {...props} />;
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={clsx('block', className)}>
      <span className="mb-1.5 block text-sm font-medium text-zinc-700">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-zinc-500">{hint}</span> : null}
    </label>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={clsx('rounded-xl bg-white ring-1 ring-zinc-200 shadow-sm', className)}>{children}</div>;
}

export function CardHeader({ title, action, subtitle }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-zinc-500">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatusBadge({ status, className }: { status: DisplayStatus; className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        STATUS_STYLE[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {icon ? <div className="mb-3 rounded-full bg-zinc-100 p-3 text-zinc-500">{icon}</div> : null}
      <p className="text-sm font-semibold text-zinc-900">{title}</p>
      {body ? <p className="mt-1 max-w-sm text-sm text-zinc-500">{body}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Alert({ tone = 'error', children }: { tone?: 'error' | 'success' | 'info'; children: ReactNode }) {
  const styles = {
    error: 'bg-rose-50 text-rose-800 ring-rose-200',
    success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    info: 'bg-brand-50 text-brand-700 ring-brand-100',
  };
  return <div className={clsx('rounded-lg px-3.5 py-2.5 text-sm ring-1 ring-inset', styles[tone])}>{children}</div>;
}

export function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'danger' | 'success' }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p
        className={clsx(
          'tabular mt-2 text-2xl font-semibold tracking-tight',
          tone === 'danger' ? 'text-red-600' : tone === 'success' ? 'text-emerald-600' : 'text-zinc-900',
        )}
      >
        {value}
      </p>
      {sub ? <p className="mt-1 text-xs text-zinc-500">{sub}</p> : null}
    </Card>
  );
}
