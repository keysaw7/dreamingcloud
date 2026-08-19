import { Button, Input, Select, Textarea } from '@dreamingcloud/ui';
import { useTranslations } from 'next-intl';

import { NEED_TYPES, type MilestoneDraft, type NeedDraft } from './types';

interface NeedsMilestonesStepProps {
  readonly busy: boolean;
  readonly milestones: MilestoneDraft[];
  readonly needs: NeedDraft[];
  readonly onBack: () => void;
  readonly onMilestonesChange: (milestones: MilestoneDraft[]) => void;
  readonly onNeedsChange: (needs: NeedDraft[]) => void;
  readonly onNext: () => void;
}

export function NeedsMilestonesStep({
  busy,
  milestones,
  needs,
  onBack,
  onMilestonesChange,
  onNeedsChange,
  onNext,
}: NeedsMilestonesStepProps) {
  const t = useTranslations('aspirations');
  const common = useTranslations('common');

  function updateNeed(index: number, updatedNeed: NeedDraft) {
    onNeedsChange(needs.map((need, currentIndex) => (currentIndex === index ? updatedNeed : need)));
  }

  function updateMilestone(index: number, updatedMilestone: MilestoneDraft) {
    onMilestonesChange(
      milestones.map((milestone, currentIndex) =>
        currentIndex === index ? updatedMilestone : milestone,
      ),
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-semibold text-lg">{t('stepNeedsTitle')}</h2>
        <p className="mt-1 text-muted-foreground text-sm">{t('stepNeedsDescription')}</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-medium">{t('sectionNeeds')}</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => onNeedsChange([...needs, { title: '', needType: 'skill' }])}
          >
            {t('addNeed')}
          </Button>
        </div>
        {needs.map((need, index) => (
          <div
            key={`need-${index}`}
            className="grid gap-2 rounded-md border border-border p-3 md:grid-cols-[minmax(0,1fr)_auto]"
          >
            <Input
              placeholder={t('needTitle')}
              aria-label={t('needTitle')}
              value={need.title}
              disabled={busy}
              onChange={(event) => updateNeed(index, { ...need, title: event.target.value })}
              required={index === 0}
            />
            <Select
              aria-label={t('needs')}
              value={need.needType}
              disabled={busy}
              onChange={(event) =>
                updateNeed(index, {
                  ...need,
                  needType: event.target.value as NeedDraft['needType'],
                })
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
            onClick={() => onMilestonesChange([...milestones, { title: '', description: '' }])}
          >
            {t('addMilestone')}
          </Button>
        </div>
        {milestones.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('noMilestones')}</p>
        ) : (
          milestones.map((milestone, index) => (
            <div
              key={`milestone-${index}`}
              className="space-y-2 rounded-md border border-border p-3"
            >
              <Input
                placeholder={t('milestoneTitle')}
                aria-label={t('milestoneTitle')}
                value={milestone.title}
                disabled={busy}
                onChange={(event) =>
                  updateMilestone(index, { ...milestone, title: event.target.value })
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
                  updateMilestone(index, { ...milestone, description: event.target.value })
                }
              />
            </div>
          ))
        )}
      </div>

      <div className="flex flex-wrap justify-between gap-3 pt-2">
        <Button type="button" variant="ghost" disabled={busy} onClick={onBack}>
          {common('previous')}
        </Button>
        <Button type="button" disabled={busy} onClick={onNext}>
          {common('next')}
        </Button>
      </div>
    </section>
  );
}
