import { ResetForm } from '../../auth-forms';

export const metadata = { title: 'Choose a new password' };

export default async function ResetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">Choose a new password</h1>
      <p className="mb-6 mt-1 text-sm text-zinc-500">You&apos;ll be signed in right after.</p>
      <ResetForm token={token} />
    </>
  );
}
