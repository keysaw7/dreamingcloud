'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('profile');
  const common = useTranslations('common');
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
      setMessage(t('updateSuccess'));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('updateFailed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <h3 className="font-medium">{t('editTitle')}</h3>
      <Field label={t('displayName')} htmlFor="me-display-name">
        <Input
          id="me-display-name"
          value={displayName}
          disabled={busy}
          onChange={(event) => setDisplayName(event.target.value)}
          required
        />
      </Field>
      <Field label={t('bio')} htmlFor="me-bio">
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
        {busy ? common('loading') : t('saveProfile')}
      </Button>
    </form>
  );
}
