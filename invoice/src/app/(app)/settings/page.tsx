import { requireUser } from '@/lib/auth';
import { appUrl } from '@/lib/email/send';
import { Alert, Card, CardHeader, PageHeader } from '@/components/ui';
import { PasswordForm, SettingsForm } from './settings-form';

export const metadata = { title: 'Settings' };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { passwordHash: _, ...user } = await requireUser();
  const { welcome } = await searchParams;
  const signupCode = process.env.SIGNUP_CODE;

  return (
    <>
      <PageHeader title="Settings" subtitle="Your details, payment instructions and invoice defaults." />
      <div className="space-y-6">
        {welcome ? (
          <Alert tone="info">
            Welcome, {user.name.split(' ')[0]}! Add your payment details below first. They show up on every invoice you
            send.
          </Alert>
        ) : null}

        {user.role === 'OWNER' ? (
          <Card>
            <CardHeader title="Invite freelancers" subtitle="Share this so freelancers can create an account and bill you." />
            <div className="space-y-2 p-5 text-sm">
              <p>
                Signup link:{' '}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">{appUrl('/signup')}</code>
              </p>
              {signupCode ? (
                <p>
                  Invite code: <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">{signupCode}</code>
                </p>
              ) : (
                <p className="text-amber-700">
                  Anyone with the link can sign up. Set <code>SIGNUP_CODE</code> in your environment to require an invite code.
                </p>
              )}
            </div>
          </Card>
        ) : null}

        <SettingsForm user={user} />
        <PasswordForm />
      </div>
    </>
  );
}
