'use client';

import {
  EMAIL_OTP_COOLDOWN_SECONDS,
  EMAIL_OTP_LENGTH,
  requestEmailCodeSchema,
} from '@dreamingcloud/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { requestEmailCode } from '../../lib/api/auth';

export function EmailVerificationField({
  disabled,
  email,
  emailCode,
  onEmailChange,
  onEmailCodeChange,
}: Readonly<{
  disabled?: boolean;
  email: string;
  emailCode: string;
  onEmailChange: (value: string) => void;
  onEmailCodeChange: (value: string) => void;
}>) {
  const t = useTranslations('auth');
  const common = useTranslations('common');
  const [codeSent, setCodeSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCooldown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function sendCode(): Promise<void> {
    setError(null);
    const parsed = requestEmailCodeSchema.safeParse({ email });
    if (!parsed.success) {
      setError(t('emailInvalid'));
      return;
    }

    setSending(true);
    try {
      await requestEmailCode(parsed.data.email);
      setCodeSent(true);
      onEmailCodeChange('');
      setCooldown(EMAIL_OTP_COOLDOWN_SECONDS);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : common('errorGeneric'));
    } finally {
      setSending(false);
    }
  }

  function handleEmailChange(value: string): void {
    if (codeSent) {
      setCodeSent(false);
      onEmailCodeChange('');
      setCooldown(0);
    }
    onEmailChange(value);
  }

  const busy = Boolean(disabled) || sending;
  const verifyLabel =
    codeSent && cooldown > 0
      ? t('resendCodeIn', { seconds: cooldown })
      : codeSent
        ? t('resendCode')
        : t('verifyEmail');

  return (
    <div className="grid gap-2">
      <label className="font-medium text-sm" htmlFor="register-email">
        {t('email')}
      </label>
      <div className="flex gap-2">
        <Input
          autoComplete="email"
          className="w-auto min-w-0 flex-1"
          disabled={busy}
          id="register-email"
          required
          type="email"
          value={email}
          onChange={(event) => handleEmailChange(event.target.value)}
        />
        <Button
          className="shrink-0"
          disabled={busy || cooldown > 0}
          type="button"
          variant="outline"
          onClick={() => void sendCode()}
        >
          {verifyLabel}
        </Button>
      </div>
      {codeSent ? (
        <>
          <p className="text-muted-foreground text-sm">{t('emailCodeSent')}</p>
          <label className="font-medium text-sm" htmlFor="register-email-code">
            {t('emailCode')}
          </label>
          <Input
            autoComplete="one-time-code"
            disabled={busy}
            id="register-email-code"
            inputMode="numeric"
            maxLength={EMAIL_OTP_LENGTH}
            pattern={`\\d{${EMAIL_OTP_LENGTH}}`}
            required
            value={emailCode}
            onChange={(event) =>
              onEmailCodeChange(event.target.value.replace(/\D/g, '').slice(0, EMAIL_OTP_LENGTH))
            }
          />
        </>
      ) : null}
      {error ? <Alert variant="destructive">{error}</Alert> : null}
    </div>
  );
}
