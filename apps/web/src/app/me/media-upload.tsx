'use client';

import { useState } from 'react';
import { Alert, Button } from '@dreamingcloud/ui';

import { apiFetch } from '../../lib/api';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function MediaUpload() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setMessage(null);
    setError(null);
    setBusy(true);
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

      const media = await apiFetch<{ data: { publicUrl: string | null } }>(
        `/media/${requested.data.mediaId}`,
      );
      setPreviewUrl(media.data.publicUrl);
      setMessage(`Média ${requested.data.mediaId} confirmé.`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload impossible');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 space-y-3 border-[var(--dc-color-border)] border-t pt-6">
      <h2 className="font-medium text-lg">Médias</h2>
      <label className="block text-sm" htmlFor="media-upload">
        Ajouter une image
        <input
          id="media-upload"
          className="mt-2 block w-full text-sm"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={(event) => void onChange(event)}
        />
      </label>
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Aperçu du média uploadé"
          className="mt-2 h-32 w-32 rounded-[var(--dc-radius-md)] object-cover"
        />
      ) : null}
      {error ? <Alert variant="danger">{error}</Alert> : null}
      {message ? <Alert variant="success">{message}</Alert> : null}
      {message || error ? (
        <Button
          variant="ghost"
          type="button"
          onClick={() => {
            setMessage(null);
            setError(null);
          }}
        >
          Effacer le statut
        </Button>
      ) : null}
    </div>
  );
}
