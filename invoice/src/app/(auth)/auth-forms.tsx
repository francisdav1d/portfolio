'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Alert, Field, Input } from '@/components/ui';
import { ActionForm, SubmitButton } from '@/components/form';
import { forgotPassword, login, resetPassword, signup } from './actions';

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(login, undefined);
  return (
    <ActionForm action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ''} />
      {state?.error ? <Alert>{state.error}</Alert> : null}
      <Field label="Email">
        <Input name="email" type="email" autoComplete="email" required autoFocus />
      </Field>
      <Field label="Password">
        <Input name="password" type="password" autoComplete="current-password" required />
      </Field>
      <div className="flex justify-end">
        <Link href="/forgot" className="text-xs font-medium text-brand-600 hover:underline">
          Forgot password?
        </Link>
      </div>
      <SubmitButton className="w-full" pendingText="Signing in…">
        Sign in
      </SubmitButton>
    </ActionForm>
  );
}

export function SignupForm({ needsCode }: { needsCode: boolean }) {
  const [state, action] = useActionState(signup, undefined);
  return (
    <ActionForm action={action} className="space-y-4">
      {state?.error ? <Alert>{state.error}</Alert> : null}
      <Field label="Full name">
        <Input name="name" autoComplete="name" required autoFocus />
      </Field>
      <Field label="Email">
        <Input name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Password" hint="At least 8 characters">
        <Input name="password" type="password" autoComplete="new-password" minLength={8} required />
      </Field>
      {needsCode ? (
        <Field label="Invite code" hint="Ask the person you work with for this code">
          <Input name="code" autoComplete="off" />
        </Field>
      ) : null}
      <SubmitButton className="w-full" pendingText="Creating account…">
        Create account
      </SubmitButton>
    </ActionForm>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState(forgotPassword, undefined);
  return (
    <ActionForm action={action} className="space-y-4">
      {state?.error ? <Alert>{state.error}</Alert> : null}
      {state?.ok ? <Alert tone="success">{state.ok}</Alert> : null}
      <Field label="Email">
        <Input name="email" type="email" autoComplete="email" required autoFocus />
      </Field>
      <SubmitButton className="w-full">Send reset link</SubmitButton>
    </ActionForm>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPassword, undefined);
  return (
    <ActionForm action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state?.error ? <Alert>{state.error}</Alert> : null}
      <Field label="New password" hint="At least 8 characters">
        <Input name="password" type="password" autoComplete="new-password" minLength={8} required autoFocus />
      </Field>
      <SubmitButton className="w-full">Save password</SubmitButton>
    </ActionForm>
  );
}
