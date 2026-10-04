import Link from 'next/link';
import { ForgotForm } from '../auth-forms';

export const metadata = { title: 'Forgot password' };

export default function ForgotPage() {
  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">Reset your password</h1>
      <p className="mb-6 mt-1 text-sm text-zinc-500">We&apos;ll email you a link to choose a new one.</p>
      <ForgotForm />
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
