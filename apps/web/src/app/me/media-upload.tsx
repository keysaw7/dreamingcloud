'use client';

import { useState } from 'react';
import { Button } from '@dreamingcloud/ui';

import { apiFetch } from '../../lib/api';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function MediaUpload() {
  const [message, setMessage] = useState<string | null>(null);

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setMessage(null);
    try {
      if (!ALLOWED.has(file.type)) {
        throw new Error('Formats acceptés : JPEG, PNG, WebP.');
      }

      const requested = await apiFetch<{
        data: { mediaId: string; uploadUrl: string };
      }>('/media/uploads', {
        method: 'POST',
        body: JSON.stringify({
          mimeType: file.type,
          sizeBytes: file.size,
        }),
      });

      const upload = await fetch(requested.data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!upload.ok) {
        throw new Error('Échec upload stockage');
      }

      await apiFetch(`/media/${requested.data.mediaId}/confirm`, {
        method: 'POST',
        body: '{}',
      });
      setMessage(`Média ${requested.data.mediaId} confirmé.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload impossible');
    }
  }

  return (
    <div className="mt-6 space-y-2 border-t border-[var(--dc-color-border)] pt-6">
      <h2 className="text-lg font-medium">Médias</h2>
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onChange} />
      <Button variant="ghost" type="button" onClick={() => setMessage(null)}>
        Effacer le statut
      </Button>
      {message ? <p className="text-sm text-[var(--dc-color-muted)]">{message}</p> : null}
    </div>
  );
}
