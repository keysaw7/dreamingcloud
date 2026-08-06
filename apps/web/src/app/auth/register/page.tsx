'use client';

import { registerUserSchema } from '@dreamingcloud/contracts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Alert, Button, Card, Field, Input, PageShell } from '@dreamingcloud/ui';

import { register } from '../../../lib/api/auth';

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations('auth');
  const [form, setForm] = useState({
    email: '',
    username: '',
    displayName: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const parsed = registerUserSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Inscription impossible');
      return;
    }

    setBusy(true);
    try {
      await register(parsed.data);
      router.push('/auth/login?registered=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inscription impossible');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell maxWidth="sm">
      <Card className="shadow-[var(--dc-shadow-md)]">
        <p className="text-sm font-semibold text-[var(--dc-color-primary)]">DreamingCloud</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{t('registerTitle')}</h1>
        <p className="mt-2 text-sm text-[var(--dc-color-muted)]">{t('verifyHint')}</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Field label={t('displayName')} htmlFor="register-display-name">
            <Input
              id="register-display-name"
              value={form.displayName}
              disabled={busy}
              onChange={(event) =>
                setForm((current) => ({ ...current, displayName: event.target.value }))
              }
              required
            />
          </Field>
          <Field label={t('username')} htmlFor="register-username">
            <Input
              id="register-username"
              value={form.username}
              disabled={busy}
              onChange={(event) =>
                setForm((current) => ({ ...current, username: event.target.value }))
              }
              required
              minLength={3}
            />
          </Field>
          <Field label={t('email')} htmlFor="register-email">
            <Input
              id="register-email"
              type="email"
              value={form.email}
              disabled={busy}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              required
              autoComplete="email"
            />
          </Field>
          <Field label={t('password')} htmlFor="register-password">
            <Input
              id="register-password"
              type="password"
              value={form.password}
              disabled={busy}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              required
              minLength={10}
              autoComplete="new-password"
            />
          </Field>
          {error ? <Alert variant="danger">{error}</Alert> : null}
          <Button type="submit" className="w-full" disabled={busy}>
            {t('registerSubmit')}
          </Button>
        </form>
        <p className="mt-4 text-sm text-[var(--dc-color-muted)]">
          {t('hasAccount')}{' '}
          <Link href="/auth/login" className="text-[var(--dc-color-primary)] underline">
            {t('loginTitle')}
          </Link>
        </p>
      </Card>
    </PageShell>
  );
}
