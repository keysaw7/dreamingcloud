'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Card } from '@dreamingcloud/ui';

import { apiFetch } from '../../../lib/api';

export default function NewAspirationPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [needTitle, setNeedTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const created = await apiFetch<{ data: { id: string; slug: string } }>('/aspirations', {
        method: 'POST',
        body: JSON.stringify({ title, story }),
      });

      if (needTitle.trim()) {
        await apiFetch(`/aspirations/${created.data.id}/needs`, {
          method: 'POST',
          body: JSON.stringify({
            needType: 'skill',
            title: needTitle,
            description: null,
          }),
        });
      }

      await apiFetch(`/aspirations/${created.data.id}/publish`, { method: 'POST', body: '{}' });
      router.push(`/aspirations/${created.data.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publication impossible');
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Card>
        <h1 className="text-2xl font-semibold">Nouvelle aspiration</h1>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm">
            Titre
            <input
              className="mt-1 w-full rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] px-3 py-2"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              minLength={3}
            />
          </label>
          <label className="block text-sm">
            Histoire
            <textarea
              className="mt-1 min-h-40 w-full rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] px-3 py-2"
              value={story}
              onChange={(event) => setStory(event.target.value)}
              required
              minLength={20}
            />
          </label>
          <label className="block text-sm">
            Premier besoin (compétence, temps, matériel…)
            <input
              className="mt-1 w-full rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] px-3 py-2"
              value={needTitle}
              onChange={(event) => setNeedTitle(event.target.value)}
              required
            />
          </label>
          {error ? <p className="text-sm text-[var(--dc-color-danger)]">{error}</p> : null}
          <Button type="submit">Publier mon rêve</Button>
        </form>
      </Card>
    </main>
  );
}
