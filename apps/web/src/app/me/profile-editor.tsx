'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, Button, Field, Input, Textarea } from '@dreamingcloud/ui';

import { apiFetch } from '../../lib/api';

export function ProfileEditor({
  initialDisplayName,
  initialBio,
}: {
  initialDisplayName: string;
  initialBio: string;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await apiFetch('/me', {
        method: 'PATCH',
        body: JSON.stringify({
          displayName: displayName.trim(),
          bio: bio.trim() || null,
        }),
      });
      setMessage('Profil mis à jour.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mise à jour impossible');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <h3 className="font-medium">Modifier mon profil</h3>
      <Field label="Nom affiché" htmlFor="me-display-name">
        <Input
          id="me-display-name"
          value={displayName}
          disabled={busy}
          onChange={(event) => setDisplayName(event.target.value)}
          required
        />
      </Field>
      <Field label="Bio" htmlFor="me-bio">
        <Textarea
          id="me-bio"
          value={bio}
          disabled={busy}
          onChange={(event) => setBio(event.target.value)}
          rows={4}
        />
      </Field>
      {error ? <Alert variant="danger">{error}</Alert> : null}
      {message ? <Alert variant="success">{message}</Alert> : null}
      <Button type="submit" disabled={busy}>
        Enregistrer le profil
      </Button>
    </form>
  );
}
