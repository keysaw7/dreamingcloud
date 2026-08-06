'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Alert, Button } from '@dreamingcloud/ui';

import { apiFetch } from '../../../lib/api';

export function FollowButton({ userId }: { userId: string }) {
  const social = useTranslations('social');
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
      <Button onClick={() => void follow()} disabled={busy}>
        {social('follow')}
      </Button>
      {message ? <Alert variant="info">{message}</Alert> : null}
    </div>
  );
}
