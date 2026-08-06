import { Alert, Badge, Button } from '@dreamingcloud/ui';
import { useTranslations } from 'next-intl';

import type { MilestoneDraft, NeedDraft } from './types';

interface ReviewStepProps {
  readonly busy: boolean;
  readonly error: string | null;
  readonly milestones: MilestoneDraft[];
  readonly needs: NeedDraft[];
  readonly story: string;
  readonly title: string;
  readonly onBack: () => void;
  readonly onSaveDraft: () => void;
  readonly onPublish: () => void;
}

export function ReviewStep({
  busy,
  error,
  milestones,
  needs,
  story,
  title,
  onBack,
  onSaveDraft,
  onPublish,
}: ReviewStepProps) {
  const t = useTranslations('aspirations');
  const common = useTranslations('common');

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-semibold text-lg">{t('stepReviewTitle')}</h2>
        <p className="mt-1 text-muted-foreground text-sm">{t('stepReviewDescription')}</p>
      </div>

      <div className="rounded-lg border border-border bg-muted p-4">
        <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
          {t('previewLabel')}
        </p>
        <h3 className="mt-3 font-semibold text-xl tracking-tight">{title || t('title')}</h3>
        <p className="mt-2 line-clamp-4 text-muted-foreground text-sm">{story || t('story')}</p>
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
        <Button type="button" variant="ghost" disabled={busy} onClick={onBack}>
          {common('previous')}
        </Button>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" disabled={busy} onClick={onSaveDraft}>
            {t('saveDraft')}
          </Button>
          <Button type="button" disabled={busy} onClick={onPublish}>
            {t('publishDream')}
          </Button>
        </div>
      </div>
    </section>
  );
}
