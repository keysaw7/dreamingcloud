'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Alert, Button, Card, Field, Input, PageShell } from '@dreamingcloud/ui';

import { requestPasswordReset } from '../../../lib/api/auth';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
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
      setError(err instanceof Error ? err.message : 'Demande impossible');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell maxWidth="sm">
      <Card>
        <h1 className="text-2xl font-semibold">{t('forgotTitle')}</h1>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Field label={t('email')} htmlFor="forgot-email">
            <Input
              id="forgot-email"
              type="email"
              value={email}
              disabled={busy}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </Field>
          {error ? <Alert variant="danger">{error}</Alert> : null}
          {message ? <Alert variant="success">{message}</Alert> : null}
          <Button type="submit" className="w-full" disabled={busy}>
            {t('forgotSubmit')}
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
