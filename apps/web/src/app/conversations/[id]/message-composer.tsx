'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@dreamingcloud/ui';

import { apiFetch } from '../../../lib/api';

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [body, setBody] = useState('');

  async function send() {
    if (body.trim().length === 0) {
      return;
    }

    await apiFetch(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
    setBody('');
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <textarea
        className="min-h-24 w-full rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] px-3 py-2"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Écrire un message…"
      />
      <Button onClick={send}>Envoyer</Button>
    </div>
  );
}
