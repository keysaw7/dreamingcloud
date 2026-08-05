'use client';

import { useState } from 'react';
import { Button } from '@dreamingcloud/ui';

import { apiFetch } from '../../../lib/api';

export function FollowButton({ userId }: { userId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function follow() {
    setBusy(true);
    setMessage(null);
    try {
      await apiFetch(`/users/${userId}/follow`, { method: 'POST', body: '{}' });
      setMessage('Vous suivez cette personne.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Action impossible');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={follow} disabled={busy}>
        Suivre
      </Button>
      {message ? <p className="text-sm text-[var(--dc-color-muted)]">{message}</p> : null}
    </div>
  );
}
