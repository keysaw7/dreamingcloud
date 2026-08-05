'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Button, Card } from '@dreamingcloud/ui';

import { apiFetch } from '../../../lib/api';

function ResetPasswordInner() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setMessage('Mot de passe mis à jour. Vous pouvez vous connecter.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Réinitialisation impossible');
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <Card>
        <h1 className="text-2xl font-semibold">Nouveau mot de passe</h1>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm">
            Mot de passe (10 caractères min.)
            <input
              className="mt-1 w-full rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] px-3 py-2"
              type="password"
              minLength={10}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error ? <p className="text-sm text-[var(--dc-color-danger)]">{error}</p> : null}
          {message ? <p className="text-sm text-[var(--dc-color-muted)]">{message}</p> : null}
          <Button type="submit" className="w-full" disabled={!token}>
            Enregistrer
          </Button>
        </form>
        <p className="mt-4 text-sm">
          <Link href="/auth/login">Connexion</Link>
        </p>
      </Card>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-md px-6 py-16">Chargement…</main>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
