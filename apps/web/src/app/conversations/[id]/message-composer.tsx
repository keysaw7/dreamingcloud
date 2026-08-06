'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Alert, Button, Field, Textarea } from '@dreamingcloud/ui';

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
    <div className="space-y-3 border-t border-[var(--dc-color-border)] pt-4">
      <Field label={t('composerLabel')} htmlFor="message-body">
        <Textarea
          id="message-body"
          className="min-h-24"
          value={body}
          disabled={busy}
          onChange={(event) => setBody(event.target.value)}
          placeholder={t('composerPlaceholder')}
        />
      </Field>
      {error ? <Alert variant="danger">{error}</Alert> : null}
      <Button disabled={busy} onClick={() => void send()}>
        {t('send')}
      </Button>
    </div>
  );
}
