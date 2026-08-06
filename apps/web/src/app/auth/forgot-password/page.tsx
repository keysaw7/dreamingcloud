'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { AuthLayout } from '../../../components/auth-layout';
import { Alert } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { requestPasswordReset } from '../../../lib/api/auth';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const common = useTranslations('common');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      await requestPasswordReset(email);
      setMessage(t('forgotSuccess'));
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
      title={t('forgotTitle')}
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <label className="grid gap-2 font-medium text-sm" htmlFor="forgot-email">
          {t('email')}
          <Input
            autoComplete="email"
            disabled={busy}
            id="forgot-email"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        {error ? <Alert variant="destructive">{error}</Alert> : null}
        {message ? <Alert variant="success">{message}</Alert> : null}
        <Button className="w-full" disabled={busy} type="submit">
          {t('forgotSubmit')}
        </Button>
      </form>
    </AuthLayout>
  );
}
