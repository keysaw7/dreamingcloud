'use client';

import { createAspirationSchema } from '@dreamingcloud/contracts';
import {
  Alert,
  Badge,
  Button,
  Card,
  Field,
  Input,
  PageShell,
  Select,
  Textarea,
} from '@dreamingcloud/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { AuthGate } from '../../../features/auth/auth-gate';
import {
  addMilestone,
  addNeed,
  createAspiration,
  publishAspiration,
} from '../../../lib/api/aspirations';
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

type Step = 1 | 2 | 3;

export default function NewAspirationPage() {
  const router = useRouter();
  const t = useTranslations('aspirations');
  const common = useTranslations('common');
  const nav = useTranslations('nav');
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [needs, setNeeds] = useState<NeedDraft[]>([{ title: '', needType: 'skill' }]);
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void apiFetch<{ data: { id: string } }>('/me')
      .then(() => {
        setAuthenticated(true);
        setAuthChecked(true);
      })
      .catch(() => {
        setAuthenticated(false);
        setAuthChecked(true);
      });
  }, []);

  async function createAspirationFlow(publish: boolean) {
    setError(null);

    const parsed = createAspirationSchema.safeParse({ title, story, visibility: 'public' });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? common('errorGeneric'));
      setStep(1);
      return;
    }

    const hasNeedOrMilestone =
      needs.some((need) => need.title.trim()) || milestones.some((item) => item.title.trim());
    if (publish && !hasNeedOrMilestone) {
      setError(t('needPublishRequirement'));
      setStep(2);
      return;
    }

    setBusy(true);
    try {
      const created = await createAspiration({
        title: parsed.data.title,
        story: parsed.data.story,
        visibility: parsed.data.visibility ?? 'public',
      });

      for (const need of needs) {
        if (!need.title.trim()) {
          continue;
        }
        await addNeed(created.id, {
          needType: need.needType,
          title: need.title.trim(),
          description: null,
        });
      }

      for (const milestone of milestones) {
        if (!milestone.title.trim()) {
          continue;
        }
        await addMilestone(created.id, {
          title: milestone.title.trim(),
          description: milestone.description.trim() || null,
        });
      }

      if (publish) {
        await publishAspiration(created.id);
      }

      router.push(`/aspirations/${created.slug || created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : common('errorGeneric'));
    } finally {
      setBusy(false);
    }
  }

  if (!authChecked) {
    return (
      <PageShell maxWidth="md" title={t('newTitle')}>
        <Card>
          <p className="text-sm text-[var(--dc-color-muted)]">{common('loading')}</p>
        </Card>
      </PageShell>
    );
  }

  if (!authenticated) {
    return (
      <PageShell maxWidth="md" title={t('newTitle')} description={t('newDescription')}>
        <AuthGate title={t('loginToCreate')} loginLabel={nav('login')} />
      </PageShell>
    );
  }

  return (
    <PageShell maxWidth="md" title={t('newTitle')} description={t('newDescription')}>
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { id: 1 as const, label: t('stepStoryTitle') },
          { id: 2 as const, label: t('stepNeedsTitle') },
          { id: 3 as const, label: t('stepReviewTitle') },
        ].map((item) => (
          <Badge key={item.id} variant={step === item.id ? 'primary' : 'default'}>
            {common('step')} {item.id} · {item.label}
          </Badge>
        ))}
      </div>

      <Card>
        {step === 1 ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">{t('stepStoryTitle')}</h2>
              <p className="mt-1 text-sm text-[var(--dc-color-muted)]">
                {t('stepStoryDescription')}
              </p>
            </div>
            <Field label={t('title')} htmlFor="aspiration-title">
              <Input
                id="aspiration-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                minLength={3}
                disabled={busy}
              />
            </Field>
            <Field label={t('story')} htmlFor="aspiration-story">
              <Textarea
                id="aspiration-story"
                className="min-h-40"
                value={story}
                onChange={(event) => setStory(event.target.value)}
                required
                minLength={20}
                disabled={busy}
              />
            </Field>
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={busy || title.trim().length < 3 || story.trim().length < 20}
                onClick={() => setStep(2)}
              >
                {common('next')}
              </Button>
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">{t('stepNeedsTitle')}</h2>
              <p className="mt-1 text-sm text-[var(--dc-color-muted)]">
                {t('stepNeedsDescription')}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium">{t('sectionNeeds')}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => setNeeds((prev) => [...prev, { title: '', needType: 'skill' }])}
                >
                  {t('addNeed')}
                </Button>
              </div>
              {needs.map((need, index) => (
                <div
                  key={`need-${index}`}
                  className="grid gap-2 rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] p-3 md:grid-cols-[1fr_140px]"
                >
                  <Input
                    placeholder={t('needTitle')}
                    aria-label={t('needTitle')}
                    value={need.title}
                    disabled={busy}
                    onChange={(event) =>
                      setNeeds((prev) =>
                        prev.map((item, i) =>
                          i === index ? { ...item, title: event.target.value } : item,
                        ),
                      )
                    }
                    required={index === 0}
                  />
                  <Select
                    aria-label={t('needs')}
                    value={need.needType}
                    disabled={busy}
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
                  </Select>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium">{t('sectionMilestones')}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => setMilestones((prev) => [...prev, { title: '', description: '' }])}
                >
                  {t('addMilestone')}
                </Button>
              </div>
              {milestones.length === 0 ? (
                <p className="text-sm text-[var(--dc-color-muted)]">{t('noMilestones')}</p>
              ) : (
                milestones.map((milestone, index) => (
                  <div
                    key={`milestone-${index}`}
                    className="space-y-2 rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] p-3"
                  >
                    <Input
                      placeholder={t('milestoneTitle')}
                      aria-label={t('milestoneTitle')}
                      value={milestone.title}
                      disabled={busy}
                      onChange={(event) =>
                        setMilestones((prev) =>
                          prev.map((item, i) =>
                            i === index ? { ...item, title: event.target.value } : item,
                          ),
                        )
                      }
                    />
                    <Textarea
                      placeholder={t('milestoneDescription')}
                      aria-label={t('milestoneDescription')}
                      rows={2}
                      className="min-h-20"
                      value={milestone.description}
                      disabled={busy}
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

            <div className="flex flex-wrap justify-between gap-3">
              <Button type="button" variant="ghost" disabled={busy} onClick={() => setStep(1)}>
                {common('previous')}
              </Button>
              <Button type="button" disabled={busy} onClick={() => setStep(3)}>
                {common('next')}
              </Button>
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">{t('stepReviewTitle')}</h2>
              <p className="mt-1 text-sm text-[var(--dc-color-muted)]">
                {t('stepReviewDescription')}
              </p>
            </div>

            <div className="rounded-[var(--dc-radius-lg)] border border-[var(--dc-color-border)] bg-[var(--dc-color-surface-muted)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--dc-color-muted)]">
                {t('previewLabel')}
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">{title || t('title')}</h3>
              <p className="mt-2 line-clamp-4 text-sm text-[var(--dc-color-muted)]">
                {story || t('story')}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {needs
                  .filter((need) => need.title.trim())
                  .map((need) => (
                    <Badge key={`${need.title}-${need.needType}`}>{need.title}</Badge>
                  ))}
                {milestones
                  .filter((milestone) => milestone.title.trim())
                  .map((milestone) => (
                    <Badge key={milestone.title} variant="primary">
                      {milestone.title}
                    </Badge>
                  ))}
              </div>
            </div>

            {error ? <Alert variant="danger">{error}</Alert> : null}

            <div className="flex flex-wrap justify-between gap-3">
              <Button type="button" variant="ghost" disabled={busy} onClick={() => setStep(2)}>
                {common('previous')}
              </Button>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => void createAspirationFlow(false)}
                >
                  {t('saveDraft')}
                </Button>
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => void createAspirationFlow(true)}
                >
                  {t('publishDream')}
                </Button>
              </div>
            </div>
          </section>
        ) : null}
      </Card>

      <p className="mt-4 text-sm text-[var(--dc-color-muted)]">
        <Link href="/" className="text-[var(--dc-color-primary)] hover:underline">
          {common('backHome')}
        </Link>
      </p>
    </PageShell>
  );
}
