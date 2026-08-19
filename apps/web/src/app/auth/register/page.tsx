'use client';

import { passwordRuleChecks, registerUserSchema } from '@dreamingcloud/contracts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { AuthLayout } from '../../../components/auth-layout';
import { Alert } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { EmailVerificationField } from '../../../features/auth/email-verification-field';
import { PasswordField } from '../../../features/auth/password-field';
import { register } from '../../../lib/api/auth';

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations('auth');
  const common = useTranslations('common');
  const [form, setForm] = useState({
    email: '',
    emailCode: '',
    username: '',
    displayName: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const passwordReady = Object.values(passwordRuleChecks).every((check) => check(form.password));

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const parsed = registerUserSchema.safeParse(form);
    if (!parsed.success) {
      setError(
        passwordReady
          ? (parsed.error.issues[0]?.message ?? common('errorGeneric'))
          : t('passwordInvalid'),
      );
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
      <form className="space-y-4" onSubmit={onSubmit}>
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
        <EmailVerificationField
          disabled={busy}
          email={form.email}
          emailCode={form.emailCode}
          onEmailChange={(email) => setForm((current) => ({ ...current, email }))}
          onEmailCodeChange={(emailCode) => setForm((current) => ({ ...current, emailCode }))}
          onVerifiedChange={setEmailVerified}
        />
        <PasswordField
          autoComplete="new-password"
          disabled={busy}
          id="register-password"
          label={t('password')}
          showRules
          value={form.password}
          onChange={(password) => setForm((current) => ({ ...current, password }))}
        />
        {error ? <Alert variant="destructive">{error}</Alert> : null}
        <Button
          className="w-full"
          disabled={busy || !passwordReady || !emailVerified}
          type="submit"
        >
          {t('registerSubmit')}
        </Button>
      </form>
    </AuthLayout>
  );
}
