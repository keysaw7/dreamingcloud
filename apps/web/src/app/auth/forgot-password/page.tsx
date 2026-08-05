'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button, Card } from '@dreamingcloud/ui';

import { apiFetch } from '../../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await apiFetch('/auth/request-password-reset', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setMessage('Si un compte existe, un e-mail de réinitialisation a été envoyé.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demande impossible');
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <Card>
        <h1 className="text-2xl font-semibold">Mot de passe oublié</h1>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm">
            E-mail
            <input
              className="mt-1 w-full rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] px-3 py-2"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          {error ? <p className="text-sm text-[var(--dc-color-danger)]">{error}</p> : null}
          {message ? <p className="text-sm text-[var(--dc-color-muted)]">{message}</p> : null}
          <Button type="submit" className="w-full">
            Envoyer le lien
          </Button>
        </form>
        <p className="mt-4 text-sm">
          <Link href="/auth/login">Retour à la connexion</Link>
        </p>
      </Card>
    </main>
  );
}
