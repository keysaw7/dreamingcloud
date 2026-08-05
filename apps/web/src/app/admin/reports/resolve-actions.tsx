'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@dreamingcloud/ui';

import { apiFetch } from '../../../lib/api';

export function ResolveReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  async function resolve(action: 'dismiss' | 'remove') {
    setMessage(null);
    try {
      await apiFetch(`/moderation/reports/${reportId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({
          action,
          reason: action === 'dismiss' ? 'Signalement rejeté' : 'Contenu retiré',
        }),
      });
      setMessage('Signalement traité.');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Action impossible');
    }
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <Button size="sm" variant="secondary" onClick={() => void resolve('dismiss')}>
        Rejeter
      </Button>
      <Button size="sm" onClick={() => void resolve('remove')}>
        Retirer
      </Button>
      {message ? <p className="w-full text-sm text-[var(--dc-color-muted)]">{message}</p> : null}
    </div>
  );
}
