'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { createContext, useContext, useTransition, type ComponentProps } from 'react';
import { btn } from './ui';

const PendingContext = createContext(false);

/**
 * A form that runs a server action without React 19's automatic field reset,
 * so typed values survive a validation error.
 */
export function ActionForm({
  action,
  children,
  ...props
}: Omit<ComponentProps<'form'>, 'action' | 'onSubmit'> & { action: (fd: FormData) => void }) {
  const [pending, start] = useTransition();
  return (
    <PendingContext.Provider value={pending}>
      <form
        {...props}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          start(() => action(fd));
        }}
      >
        {children}
      </form>
    </PendingContext.Provider>
  );
}

export function SubmitButton({
  variant = 'primary',
  className,
  children,
  pendingText,
  ...props
}: ComponentProps<'button'> & { variant?: keyof typeof btn; pendingText?: string }) {
  const pending = useFormStatus().pending || useContext(PendingContext);
  return (
    <button type="submit" disabled={pending || props.disabled} className={clsx(btn[variant], className)} {...props}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {pending && pendingText ? pendingText : children}
    </button>
  );
}

/** Button that submits its own server action, with an optional confirm prompt. */
export function ActionButton({
  action,
  confirm,
  variant = 'secondary',
  children,
  className,
  fields,
}: {
  action: (fd: FormData) => void | Promise<void>;
  confirm?: string;
  variant?: keyof typeof btn;
  children: React.ReactNode;
  className?: string;
  fields?: Record<string, string>;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {Object.entries(fields ?? {}).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <SubmitButton variant={variant} className={className}>
        {children}
      </SubmitButton>
    </form>
  );
}
