'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense, useState } from 'react';

import { AuthLayout } from '../../../components/auth-layout';
import { Alert } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { PasswordField } from '../../../features/auth/password-field';
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
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t('loginFailed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title={t('loginTitle')}
      footer={
        <>
          <span>{t('noAccount')} </span>
          <Link className="font-semibold text-primary hover:underline" href="/auth/register">
            {nav('register')}
          </Link>
        </>
      }
    >
      {registered ? <Alert variant="success">{t('registerSuccess')}</Alert> : null}
      <form className="mt-6 space-y-5" onSubmit={onSubmit}>
        <label className="grid gap-2 font-medium text-sm" htmlFor="login-email">
          {t('email')}
          <Input
            autoComplete="email"
            disabled={busy}
            id="login-email"
            inputMode="email"
            required
            type="text"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <PasswordField
          autoComplete="current-password"
          disabled={busy}
          id="login-password"
          label={t('password')}
          value={password}
          onChange={setPassword}
        />
        {error ? <Alert variant="destructive">{error}</Alert> : null}
        <Button className="w-full" disabled={busy} type="submit">
          {t('loginSubmit')}
        </Button>
      </form>
      <Link
        className="mt-5 inline-block text-primary text-sm hover:underline"
        href="/auth/forgot-password"
      >
        {t('forgotPassword')}
      </Link>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
