'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Card } from '@dreamingcloud/ui';

import { apiFetch } from '../../../lib/api';

const NEED_TYPES = ['skill', 'material', 'time', 'contact', 'other'] as const;

interface NeedDraft {
  title: string;
  needType: (typeof NEED_TYPES)[number];
}

interface MilestoneDraft {
  title: string;
  description: string;
}

export default function NewAspirationPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [needs, setNeeds] = useState<NeedDraft[]>([{ title: '', needType: 'skill' }]);
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function createAspiration(publish: boolean) {
    setError(null);
    setBusy(true);
    try {
      const created = await apiFetch<{ data: { id: string; slug: string } }>('/aspirations', {
        method: 'POST',
        body: JSON.stringify({ title, story }),
      });

      for (const need of needs) {
        if (!need.title.trim()) {
          continue;
        }
        await apiFetch(`/aspirations/${created.data.id}/needs`, {
          method: 'POST',
          body: JSON.stringify({
            needType: need.needType,
            title: need.title.trim(),
            description: null,
          }),
        });
      }

      for (const milestone of milestones) {
        if (!milestone.title.trim()) {
          continue;
        }
        await apiFetch(`/aspirations/${created.data.id}/milestones`, {
          method: 'POST',
          body: JSON.stringify({
            title: milestone.title.trim(),
            description: milestone.description.trim() || null,
          }),
        });
      }

      if (publish) {
        await apiFetch(`/aspirations/${created.data.id}/publish`, {
          method: 'POST',
          body: '{}',
        });
      }

      router.push(`/aspirations/${created.data.slug || created.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Card>
        <h1 className="text-2xl font-semibold">Nouvelle aspiration</h1>
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void createAspiration(true);
          }}
        >
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Besoins</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setNeeds((prev) => [...prev, { title: '', needType: 'skill' }])}
              >
                Ajouter un besoin
              </Button>
            </div>
            {needs.map((need, index) => (
              <div
                key={`need-${index}`}
                className="grid gap-2 rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] p-3 md:grid-cols-[1fr_140px]"
              >
                <input
                  className="rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] px-3 py-2"
                  placeholder="Titre du besoin"
                  value={need.title}
                  onChange={(event) =>
                    setNeeds((prev) =>
                      prev.map((item, i) =>
                        i === index ? { ...item, title: event.target.value } : item,
                      ),
                    )
                  }
                  required={index === 0}
                />
                <select
                  className="rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] px-3 py-2"
                  value={need.needType}
                  onChange={(event) =>
                    setNeeds((prev) =>
                      prev.map((item, i) =>
                        i === index
                          ? {
                              ...item,
                              needType: event.target.value as (typeof NEED_TYPES)[number],
                            }
                          : item,
                      ),
                    )
                  }
                >
                  {NEED_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Jalons</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setMilestones((prev) => [...prev, { title: '', description: '' }])}
              >
                Ajouter un jalon
              </Button>
            </div>
            {milestones.length === 0 ? (
              <p className="text-sm text-[var(--dc-color-muted)]">Aucun jalon pour l’instant.</p>
            ) : (
              milestones.map((milestone, index) => (
                <div
                  key={`milestone-${index}`}
                  className="space-y-2 rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] p-3"
                >
                  <input
                    className="w-full rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] px-3 py-2"
                    placeholder="Titre du jalon"
                    value={milestone.title}
                    onChange={(event) =>
                      setMilestones((prev) =>
                        prev.map((item, i) =>
                          i === index ? { ...item, title: event.target.value } : item,
                        ),
                      )
                    }
                  />
                  <textarea
                    className="w-full rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] px-3 py-2"
                    placeholder="Description (optionnel)"
                    rows={2}
                    value={milestone.description}
                    onChange={(event) =>
                      setMilestones((prev) =>
                        prev.map((item, i) =>
                          i === index ? { ...item, description: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </div>
              ))
            )}
          </div>

          {error ? <p className="text-sm text-[var(--dc-color-danger)]">{error}</p> : null}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={busy}>
              Publier mon rêve
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => void createAspiration(false)}
            >
              Enregistrer en brouillon
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}
