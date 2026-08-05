'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Button, Card } from '@dreamingcloud/ui';

import { apiFetch } from '../../../lib/api';

function VerifyEmailInner() {
  const params = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Lien de vérification invalide.');
      return;
    }

    let cancelled = false;
    setStatus('loading');
    void apiFetch('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
      .then(() => {
        if (!cancelled) {
          setStatus('ok');
          setMessage('Adresse e-mail vérifiée. Vous pouvez vous connecter.');
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
  }, [token]);

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <Card>
        <h1 className="text-2xl font-semibold">Vérification e-mail</h1>
        <p className="mt-4 text-sm text-[var(--dc-color-muted)]">
          {status === 'loading' ? 'Vérification en cours…' : (message ?? '')}
        </p>
        {status === 'ok' ? (
          <Link href="/auth/login" className="mt-6 inline-block">
            <Button>Se connecter</Button>
          </Link>
        ) : null}
      </Card>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-md px-6 py-16">Chargement…</main>}>
      <VerifyEmailInner />
    </Suspense>
  );
}
