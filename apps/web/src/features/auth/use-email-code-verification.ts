'use client';

import { EMAIL_OTP_LENGTH } from '@dreamingcloud/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { verifyEmailCode } from '../../lib/api/auth';

export function useEmailCodeVerification({
  email,
  emailCode,
  onVerifiedChange,
}: {
  email: string;
  emailCode: string;
  onVerifiedChange: (verified: boolean) => void;
}): {
  checking: boolean;
  verified: boolean;
  error: string | null;
  reset: () => void;
} {
  const common = useTranslations('common');
  const errorGeneric = common('errorGeneric');
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (emailCode.length !== EMAIL_OTP_LENGTH) {
      setVerified(false);
      setChecking(false);
      onVerifiedChange(false);
      return;
    }

    let cancelled = false;
    setChecking(true);
    setError(null);
    setVerified(false);
    onVerifiedChange(false);

    void verifyEmailCode(email, emailCode)
      .then(() => {
        if (cancelled) {
          return;
        }

        setVerified(true);
        onVerifiedChange(true);
      })
      .catch((verifyError: unknown) => {
        if (cancelled) {
          return;
        }

        setError(verifyError instanceof Error ? verifyError.message : errorGeneric);
        onVerifiedChange(false);
      })
      .finally(() => {
        if (!cancelled) {
          setChecking(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [email, emailCode, errorGeneric, onVerifiedChange]);

  function reset(): void {
    setVerified(false);
    setChecking(false);
    setError(null);
    onVerifiedChange(false);
  }

  return { checking, verified, error, reset };
}
