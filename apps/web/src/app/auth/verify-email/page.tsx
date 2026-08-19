'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense, useEffect, useState } from 'react';

import { AuthLayout } from '../../../components/auth-layout';
import { Alert } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { verifyEmail } from '../../../lib/api/auth';

function VerifyEmailInner() {
  const params = useSearchParams();
  const t = useTranslations('auth');
  const common = useTranslations('common');
  const token = params.get('token');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(t('verifyMissingToken'));
      return;
    }

    let cancelled = false;
    setStatus('loading');
    void verifyEmail(token)
      .then(() => {
        if (!cancelled) {
          setStatus('ok');
          setMessage(t('verifySuccess'));
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setStatus('error');
          setMessage(error instanceof Error ? error.message : common('errorGeneric'));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [common, token, t]);

  return (
    <AuthLayout title={t('verifyTitle')}>
      <div className="space-y-5">
        {status === 'loading' ? (
          <p className="text-muted-foreground text-sm">{common('loading')}</p>
        ) : null}
        {status === 'ok' && message ? <Alert variant="success">{message}</Alert> : null}
        {status === 'error' && message ? <Alert variant="destructive">{message}</Alert> : null}
        {status === 'ok' ? (
          <Button asChild className="w-full">
            <Link href="/auth/login">{t('loginSubmit')}</Link>
          </Button>
        ) : null}
      </div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  const t = useTranslations('auth');
  const common = useTranslations('common');
  return (
    <Suspense
      fallback={
        <AuthLayout title={t('verifyTitle')}>
          <p className="text-muted-foreground text-sm">{common('loading')}</p>
        </AuthLayout>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}
