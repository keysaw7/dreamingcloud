'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense, useEffect, useState } from 'react';
import { Alert, Button, Card, PageShell } from '@dreamingcloud/ui';

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
          setMessage(error instanceof Error ? error.message : 'Vérification impossible');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, t]);

  return (
    <PageShell maxWidth="sm">
      <Card>
        <h1 className="text-2xl font-semibold">{t('verifyTitle')}</h1>
        <div className="mt-4">
          {status === 'loading' ? (
            <p className="text-sm text-[var(--dc-color-muted)]">{common('loading')}</p>
          ) : null}
          {status === 'ok' && message ? <Alert variant="success">{message}</Alert> : null}
          {status === 'error' && message ? <Alert variant="danger">{message}</Alert> : null}
        </div>
        {status === 'ok' ? (
          <Link href="/auth/login" className="mt-6 inline-block">
            <Button>{t('loginSubmit')}</Button>
          </Link>
        ) : null}
      </Card>
    </PageShell>
  );
}

export default function VerifyEmailPage() {
  const common = useTranslations('common');
  return (
    <Suspense
      fallback={
        <PageShell maxWidth="sm">
          <p>{common('loading')}</p>
        </PageShell>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}
