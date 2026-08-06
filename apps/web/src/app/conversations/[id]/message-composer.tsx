'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Alert } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { apiFetch } from '../../../lib/api';

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const t = useTranslations('conversations');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function send() {
    if (body.trim().length === 0) {
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      });
      setBody('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Envoi impossible');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 border-border border-t pt-4" aria-busy={busy}>
      <div className="space-y-1.5">
        <label htmlFor="message-body" className="block font-medium text-sm">
          {t('composerLabel')}
        </label>
        <Textarea
          id="message-body"
          aria-describedby={error ? 'message-composer-error' : undefined}
          aria-invalid={error ? true : undefined}
          value={body}
          disabled={busy}
          onChange={(event) => setBody(event.target.value)}
          placeholder={t('composerPlaceholder')}
        />
      </div>
      {error ? (
        <Alert id="message-composer-error" variant="destructive">
          {error}
        </Alert>
      ) : null}
      <Button type="button" disabled={busy} onClick={() => void send()}>
        {t('send')}
      </Button>
    </div>
  );
}
