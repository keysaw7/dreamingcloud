'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Card } from '@dreamingcloud/ui';

import { apiFetch } from '../../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    username: '',
    displayName: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      router.push('/auth/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inscription impossible');
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <Card>
        <h1 className="text-2xl font-semibold">Créer un compte</h1>
        <p className="mt-2 text-sm text-[var(--dc-color-muted)]">
          Vérifiez votre e-mail après l’inscription pour activer votre compte.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {(
            [
              ['displayName', 'Nom affiché', 'text'],
              ['username', 'Nom d’utilisateur', 'text'],
              ['email', 'E-mail', 'email'],
              ['password', 'Mot de passe', 'password'],
            ] as const
          ).map(([key, label, type]) => (
            <label key={key} className="block text-sm">
              {label}
              <input
                className="mt-1 w-full rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] px-3 py-2"
                type={type}
                value={form[key]}
                onChange={(event) =>
                  setForm((current) => ({ ...current, [key]: event.target.value }))
                }
                required
              />
            </label>
          ))}
          {error ? <p className="text-sm text-[var(--dc-color-danger)]">{error}</p> : null}
          <Button type="submit" className="w-full">
            Créer mon compte
          </Button>
        </form>
        <p className="mt-4 text-sm text-[var(--dc-color-muted)]">
          Déjà inscrit ? <Link href="/auth/login">Connexion</Link>
        </p>
      </Card>
    </main>
  );
}
