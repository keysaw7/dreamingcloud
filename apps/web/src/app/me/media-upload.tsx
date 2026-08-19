'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Alert, Button } from '@dreamingcloud/ui';

import { apiFetch } from '../../lib/api';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function MediaUpload() {
  const t = useTranslations('profile');
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
        throw new Error(t('invalidMediaType'));
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
        throw new Error(t('storageUploadFailed'));
      }

      await apiFetch(`/media/${requested.data.mediaId}/confirm`, {
        method: 'POST',
        body: '{}',
      });

      const media = await apiFetch<{ data: { publicUrl: string | null } }>(
        `/media/${requested.data.mediaId}`,
      );
      setPreviewUrl(media.data.publicUrl);
      setMessage(t('mediaConfirmed'));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : t('uploadFailed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 space-y-3 border-border border-t pt-6">
      <h2 className="font-medium text-lg">{t('mediaTitle')}</h2>
      <label className="block text-sm" htmlFor="media-upload">
        {t('addImage')}
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
          alt={t('mediaPreviewAlt')}
          className="mt-2 size-32 rounded-md object-cover"
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
          {t('clearStatus')}
        </Button>
      ) : null}
    </div>
  );
}
