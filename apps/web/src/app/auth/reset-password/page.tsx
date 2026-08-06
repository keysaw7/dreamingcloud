'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense, useState } from 'react';
import { Alert, Button, Card, Field, Input, PageShell } from '@dreamingcloud/ui';

import { resetPassword } from '../../../lib/api/auth';

function ResetPasswordInner() {
  const params = useSearchParams();
  const t = useTranslations('auth');
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
      setError(err instanceof Error ? err.message : 'Réinitialisation impossible');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell maxWidth="sm">
      <Card>
        <h1 className="text-2xl font-semibold">{t('resetTitle')}</h1>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Field label={t('password')} htmlFor="reset-password">
            <Input
              id="reset-password"
              type="password"
              minLength={10}
              value={password}
              disabled={busy}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="new-password"
            />
          </Field>
          {error ? <Alert variant="danger">{error}</Alert> : null}
          {message ? <Alert variant="success">{message}</Alert> : null}
          <Button type="submit" className="w-full" disabled={!token || busy}>
            {t('resetSubmit')}
          </Button>
        </form>
        <p className="mt-4 text-sm">
          <Link href="/auth/login" className="underline">
            {t('loginTitle')}
          </Link>
        </p>
      </Card>
    </PageShell>
  );
}

export default function ResetPasswordPage() {
  const common = useTranslations('common');
  return (
    <Suspense
      fallback={
        <PageShell maxWidth="sm">
          <p>{common('loading')}</p>
        </PageShell>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
