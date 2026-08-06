'use client';

import { createAspirationSchema } from '@dreamingcloud/contracts';
import { Badge, Button, Card, PageShell } from '@dreamingcloud/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { AuthGate } from '../../../features/auth/auth-gate';
import { useAuthSession } from '../../../features/auth/use-auth-session';
import {
  addMilestone,
  addNeed,
  createAspiration,
  publishAspiration,
} from '../../../lib/api/aspirations';
import { CreationLoadingSkeleton } from './creation-loading-skeleton';
import { CreationStep } from './creation-step';
import { NeedsMilestonesStep } from './needs-milestones-step';
import { ReviewStep } from './review-step';
import type { CreationStep as CreationStepNumber, MilestoneDraft, NeedDraft } from './types';

export default function NewAspirationPage() {
  const router = useRouter();
  const t = useTranslations('aspirations');
  const common = useTranslations('common');
  const nav = useTranslations('nav');
  const { checked: authChecked, userId } = useAuthSession();
  const [step, setStep] = useState<CreationStepNumber>(1);
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [needs, setNeeds] = useState<NeedDraft[]>([{ title: '', needType: 'skill' }]);
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
        <CreationLoadingSkeleton label={common('loading')} />
      </PageShell>
    );
  }

  if (!userId) {
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

      <Card className="p-6">
        {step === 1 ? (
          <CreationStep
            busy={busy}
            story={story}
            title={title}
            onStoryChange={setStory}
            onTitleChange={setTitle}
            onNext={() => setStep(2)}
          />
        ) : null}

        {step === 2 ? (
          <NeedsMilestonesStep
            busy={busy}
            milestones={milestones}
            needs={needs}
            onBack={() => setStep(1)}
            onMilestonesChange={setMilestones}
            onNeedsChange={setNeeds}
            onNext={() => setStep(3)}
          />
        ) : null}

        {step === 3 ? (
          <ReviewStep
            busy={busy}
            error={error}
            milestones={milestones}
            needs={needs}
            story={story}
            title={title}
            onBack={() => setStep(2)}
            onSaveDraft={() => void createAspirationFlow(false)}
            onPublish={() => void createAspirationFlow(true)}
          />
        ) : null}
      </Card>

      <div className="mt-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">{common('backHome')}</Link>
        </Button>
      </div>
    </PageShell>
  );
}
