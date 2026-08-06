'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense, useState } from 'react';
import { Alert, Button, Card, Field, Input, PageShell } from '@dreamingcloud/ui';

import { login } from '../../../lib/api/auth';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const t = useTranslations('auth');
  const nav = useTranslations('nav');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const registered = params.get('registered') === '1';

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loginFailed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell maxWidth="sm">
      <Card className="shadow-[var(--dc-shadow-md)]">
        <p className="text-sm font-semibold text-[var(--dc-color-primary)]">DreamingCloud</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{t('loginTitle')}</h1>
        {registered ? (
          <Alert className="mt-4" variant="success">
            {t('registerSuccess')}
          </Alert>
        ) : null}
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Field label={t('email')} htmlFor="login-email">
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={busy}
              autoComplete="email"
            />
          </Field>
          <Field label={t('password')} htmlFor="login-password">
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={busy}
              autoComplete="current-password"
            />
          </Field>
          {error ? <Alert variant="danger">{error}</Alert> : null}
          <Button type="submit" className="w-full" disabled={busy}>
            {t('loginSubmit')}
          </Button>
        </form>
        <p className="mt-4 text-sm text-[var(--dc-color-muted)]">
          {t('noAccount')}{' '}
          <Link
            href="/auth/register"
            className="font-medium text-[var(--dc-color-primary)] hover:underline"
          >
            {nav('register')}
          </Link>
        </p>
        <p className="mt-2 text-sm">
          <Link href="/auth/forgot-password" className="hover:underline">
            {t('forgotPassword')}
          </Link>
        </p>
      </Card>
    </PageShell>
  );
}

export default function LoginPage() {
  const common = useTranslations('common');
  return (
    <Suspense
      fallback={
        <PageShell maxWidth="sm">
          <p>{common('loading')}</p>
        </PageShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
