'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense, useState } from 'react';

import { AuthLayout } from '../../../components/auth-layout';
import { Alert } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { resetPassword } from '../../../lib/api/auth';

function ResetPasswordInner() {
  const params = useSearchParams();
  const t = useTranslations('auth');
  const common = useTranslations('common');
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      await resetPassword(token, password);
      setMessage(t('resetSuccess'));
    } catch (err) {
      setError(err instanceof Error ? err.message : common('errorGeneric'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      brand={common('appName')}
      footer={
        <Link className="font-semibold text-primary hover:underline" href="/auth/login">
          {t('loginTitle')}
        </Link>
      }
      title={t('resetTitle')}
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <label className="grid gap-2 font-medium text-sm" htmlFor="reset-password">
          {t('password')}
          <Input
            autoComplete="new-password"
            disabled={busy}
            id="reset-password"
            minLength={10}
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <Alert variant="destructive">{error}</Alert> : null}
        {message ? <Alert variant="success">{message}</Alert> : null}
        <Button className="w-full" disabled={!token || busy} type="submit">
          {t('resetSubmit')}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  const common = useTranslations('common');
  return (
    <Suspense
      fallback={
        <AuthLayout brand={common('appName')} title={t('resetTitle')}>
          <p className="text-muted-foreground text-sm">{common('loading')}</p>
        </AuthLayout>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
