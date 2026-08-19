import { Button, Field, Input, Textarea } from '@dreamingcloud/ui';
import { useTranslations } from 'next-intl';

interface CreationStepProps {
  readonly busy: boolean;
  readonly story: string;
  readonly title: string;
  readonly onStoryChange: (value: string) => void;
  readonly onTitleChange: (value: string) => void;
  readonly onNext: () => void;
}

export function CreationStep({
  busy,
  story,
  title,
  onStoryChange,
  onTitleChange,
  onNext,
}: CreationStepProps) {
  const t = useTranslations('aspirations');
  const common = useTranslations('common');

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-semibold text-lg">{t('stepStoryTitle')}</h2>
        <p className="mt-1 text-muted-foreground text-sm">{t('stepStoryDescription')}</p>
      </div>
      <Field label={t('title')} htmlFor="aspiration-title">
        <Input
          id="aspiration-title"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
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
          onChange={(event) => onStoryChange(event.target.value)}
          required
          minLength={20}
          disabled={busy}
        />
      </Field>
      <div className="flex justify-end pt-2">
        <Button
          type="button"
          disabled={busy || title.trim().length < 3 || story.trim().length < 20}
          onClick={onNext}
        >
          {common('next')}
        </Button>
      </div>
    </section>
  );
}
