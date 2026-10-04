import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { SignupForm } from '../auth-forms';

export const metadata = { title: 'Create account' };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect('/dashboard');
  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
      <p className="mb-6 mt-1 text-sm text-zinc-500">Send invoices and track when you get paid.</p>
      <SignupForm needsCode={!!process.env.SIGNUP_CODE} />
      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
