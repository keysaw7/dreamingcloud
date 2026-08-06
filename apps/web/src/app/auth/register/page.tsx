'use client';

import { registerUserSchema } from '@dreamingcloud/contracts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { AuthLayout } from '../../../components/auth-layout';
import { Alert } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { register } from '../../../lib/api/auth';

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations('auth');
  const common = useTranslations('common');
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
      setError(parsed.error.issues[0]?.message ?? common('errorGeneric'));
      return;
    }

    setBusy(true);
    try {
      await register(parsed.data);
      router.push('/auth/login?registered=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : common('errorGeneric'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      brand={common('appName')}
      description={t('verifyHint')}
      footer={
        <>
          <span>{t('hasAccount')} </span>
          <Link className="font-semibold text-primary hover:underline" href="/auth/login">
            {t('loginTitle')}
          </Link>
        </>
      }
      title={t('registerTitle')}
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <label className="grid gap-2 font-medium text-sm" htmlFor="register-display-name">
          {t('displayName')}
          <Input
            disabled={busy}
            id="register-display-name"
            required
            value={form.displayName}
            onChange={(event) =>
              setForm((current) => ({ ...current, displayName: event.target.value }))
            }
          />
        </label>
        <label className="grid gap-2 font-medium text-sm" htmlFor="register-username">
          {t('username')}
          <Input
            autoComplete="username"
            disabled={busy}
            id="register-username"
            minLength={3}
            required
            value={form.username}
            onChange={(event) =>
              setForm((current) => ({ ...current, username: event.target.value }))
            }
          />
        </label>
        <label className="grid gap-2 font-medium text-sm" htmlFor="register-email">
          {t('email')}
          <Input
            autoComplete="email"
            disabled={busy}
            id="register-email"
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </label>
        <label className="grid gap-2 font-medium text-sm" htmlFor="register-password">
          {t('password')}
          <Input
            autoComplete="new-password"
            disabled={busy}
            id="register-password"
            minLength={10}
            required
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
          />
        </label>
        {error ? <Alert variant="destructive">{error}</Alert> : null}
        <Button className="w-full" disabled={busy} type="submit">
          {t('registerSubmit')}
        </Button>
      </form>
    </AuthLayout>
  );
}
